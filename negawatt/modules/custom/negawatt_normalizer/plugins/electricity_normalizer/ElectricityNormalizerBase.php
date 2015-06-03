<?php

/**
 * @file
 * Contains ElectricityNormalizerBase.
 */

abstract class ElectricityNormalizerBase implements \ElectricityNormalizerInterface {

  /**
   * The meter node.
   *
   * @var stdClass
   */
  protected $meterNode = NULL;

  /**
   * Time manager.
   *
   * @var NegaWattNormalizerTimeManagerInterface
   */
  protected $timeManager = NULL;

  /**
   * Data provider manager.
   *
   * @var NegaWattNormalizerDataProviderManagerInterface
   */
  protected $dataProviderManager = NULL;

  /**
   * Entities analyzer.
   *
   * @var NegaWattNormalizerAnalyzerManager
   */
  protected $analyzerManager = NULL;


  /**
   * Holds the max-frequency allowed for the current meter node.
   *
   * @var int
   */
  protected $meterMaxFrequency = NULL;

  /**
   * Holds the last-processed timestamp of the current meter node.
   *
   * @var int
   */
  protected $meterLastProcessed = NULL;

  /**
   * Get the meter node.
   *
   * @return stdClass
   *   The meter node object.
   */
  public function getMeterNode() {
    return $this->meterNode;
  }

  /**
   * Set the meter node.
   *
   * @param stdClass $meter_node
   *   The meter node object.
   */
  public function setMeterNode($meter_node) {
    $this->meterNode = $meter_node;

    // Save meter's max allowed frequency and last-processed fields.
    $wrapper = entity_metadata_wrapper('node', $meter_node);
    $this->meterMaxFrequency = $wrapper->field_max_frequency->value();
    $this->meterLastProcessed = $wrapper->field_last_processed->value();
  }

  /**
   * Get the current meter-node's max allowed frequency.
   *
   * @return int
   *   The max allowed frequency for the meter node.
   */
  protected function getMeterMaxFrequency() {
    return $this->meterMaxFrequency;
  }

  /**
   * Get the current meter-node's last-processed timestamp.
   *
   * @return int
   *   The meter's last-processed.
   */
  protected function getMeterLastProcessed() {
    return $this->meterLastProcessed;
  }

  /**
   * Get the active time manager.
   *
   * @return NegaWattNormalizerTimeManagerInterface
   */
  public function getTimeManager() {
    return $this->timeManager;
  }

  /**
   * Get the active data provider manager.
   *
   * @return NegaWattNormalizerDataProviderInterface
   */
  public function getDataProviderManager() {
    return $this->dataProviderManager;
  }

  /**
   * Get the active entities analyzer.
   *
   * @return NegaWattNormalizerAnalyzerManager
   */
  public function getAnalyzerManager() {
    return $this->analyzerManager;
  }

  /**
   * Class constructor.
   *
   * @param array $plugin
   *   The plugin definition array.
   */
  public function __construct(array $plugin,
                              NegaWattNormalizerTimeManagerInterface $time_manager = NULL,
                              NegaWattNormalizerDataProviderManagerInterface $data_provider_manager = NULL,
                              NegaWattNormalizerAnalyzerInterface $analyzer_manager = NULL) {
    $this->plugin = $plugin;

    $this->timeManager         = $time_manager          ? $time_manager          : new \NegaWattNormalizerTimeManagerBase();
    $this->dataProviderManager = $data_provider_manager ? $data_provider_manager : new \NegaWattNormalizerDataProviderManagerBase();
    $this->analyzerManager     = $analyzer_manager      ? $analyzer_manager      : new \NegaWattNormalizerAnalyzerManager();

    // Prepare analyzers
    $this->analyzerManager->addAnalyzer(new \NegaWattNormalizerAnalyzerCompareLastYear($this->dataProviderManager));
  }

  /**
   * Calc TOUse rate tape according to current timestamp.
   *
   * @param $timestamp
   *    The time of consumption.
   *
   * @return object
   *    rate_type: The touse rate type - one of 'peak', 'mid', 'low',
   *    rate: The rate in NIS without VAT.
   */
  public function calcTouseRateType($timestamp) {
    $rate_class = 3; // תעו"ז נמוך
    $week_day = date('w', $timestamp);
    // Sat is 3, Fri is 2, others are 1.
    // @todo: read day type from holidays table
    $day_type = ($week_day == 6) ? 3 : (($week_day == 5) ? 2 : 1);
    $month = date('n', $timestamp);
    $hour = date('G', $timestamp);

    foreach ($this->touse_seasons as $effective_to => $seasons_data) {
      // Find 'effective from' timestamp
      if ($timestamp >= $effective_to) {
        continue;
      }
      // Find season
      foreach ($seasons_data as $to_month => $season) {
        if ($month >= $to_month) {
          continue;
        }
        // Find rate-type
        foreach ($this->touse_rate_types[$effective_to][$season][$day_type] as $to_hour => $rate_type) {
          if ($hour >= $to_hour) {
            continue;
          }
          $rate = $this->touse_rates[$effective_to][$rate_class][$season][$rate_type];
          return (object) array(
            'rate_type' => $rate_type,
            'rate' => $rate,
          );
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function process($frequencies = array(), $from_timestamp = NULL, $to_timestamp = NULL) {

    // If frequencies was empty, set it to all allowed frequencies.
    $allowed_frequencies = $this->getTimeManager()->getAllowedFrequencies($this->getMeterMaxFrequency());
    $frequencies = $frequencies ? $frequencies : $allowed_frequencies;

    // Output debug message.
    self::debugMessage(format_string('frequencies: [@frequencies],', array('@frequencies' => implode(',', \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequencies)))), 1);
    self::debugMessage("time-frame: [@time_from,@time_to].", 1, $from_timestamp, $to_timestamp);

    $processed_entities = array();
    $last_processed = 0;
    foreach ($frequencies as $frequency) {
      // Make sure frequency is valid.
      if (!in_array($frequency, $allowed_frequencies)) {
        throw new \Exception(format_string('Frequency "@freq" not in allowed frequencies.', array('@freq' => \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequency))));
      }

      $result = $this->processByFrequency($frequency, $from_timestamp, $to_timestamp);
      $last_processed = max($last_processed, $result['last_processed']);
      if ($result['entities']) {
        $processed_entities[$frequency] = $result['entities'];
      }

      if (!$processed_entities) {
        // Nothing was found, no point in processing lower frequencies.
        self::debugMessage('No entity was returned, ending process().', 1);
        break;
      }
    }

    // Output debug message.
    self::debugMessage(format_string('@count entities returned.', array('@count' => count($processed_entities))), 1);

    // Analyze result entities
    self::debugMessage('Analyzing result entities.', 1);
    $this->getAnalyzerManager()->analyze($processed_entities);

    // Put proper message and mark node as processed.
    $this->markMeterNodeAsProcessed($frequencies, $from_timestamp, $to_timestamp, $last_processed, count($processed_entities));

    return $processed_entities;
  }

  /**
   * Put proper message and mark node as processed.
   *
   * @param array $frequencies
   *    The frequencies processed.
   * @param int $from_timestamp
   *    Beginning of time-frame.
   * @param int $to_timestamp
   *    End of time-frame.
   * @param int $last_processed
   *    Timestamp of last entity processed.
   * @param $num_entities
   *    Number of entities processed.
   */
  protected function markMeterNodeAsProcessed($frequencies, $from_timestamp, $to_timestamp, $last_processed, $num_entities) {
    if (!$node = $this->getMeterNode()) {
      return;
    }

    // Generate 'normalization completed' message.
    // Prepare arguments.
    $arguments = array(
      '@frequencies' => implode(',', \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequencies)),
      '@time_period' => date('Y-m-d H:i', $from_timestamp) . ',' . date('Y-m-d H:i', $to_timestamp),
      '@entities' => $num_entities,
    );

    // Prepare the message.
    $user_account = user_load($node->uid);
    $message = message_create('normalization_completed', array('arguments' => $arguments), $user_account);
    $wrapper = entity_metadata_wrapper('message', $message);
    $wrapper->field_meter->set($node);
    $wrapper->save();

    // Save last processed node field.
    $wrapper = entity_metadata_wrapper('node', $this->getMeterNode());
    $wrapper->field_meter_processed->set(TRUE);
    $wrapper->field_last_processed->set($last_processed);

    // Set 'has_electricity' field.
    if ($num_entities) {
      $wrapper->field_has_electricity->set(TRUE);
    }

    $wrapper->save();

    // Also save in cache
    $this->meterLastProcessed = $last_processed;
  }

  /**
   * Process entities by one frequency.
   *
   * Called from ElectricityNormalizerBase::process() for each frequency.
   *
   * @param string $frequency
   *    The frequency to use (HOUR, MONTH, etc.).
   * @param int $from_timestamp
   *    Beginning of time-frame.
   * @param int $to_timestamp
   *    End of time-frame.
   * @return array - entities: An array of the processed entities, or empty array if there
   * - entities: An array of the processed entities, or empty array if there
   * were no values to process.
   * - last_processed: updated value for last processed node field. Caller
   * should save this value.
   *
   */
  protected function processByFrequency($frequency, $from_timestamp = NULL, $to_timestamp = NULL) {
    // Loop over all the time slices and process them one by one using processByTimePeriod

    // Get last processed timestamp of the meter node.
    $last_processed = $this->getMeterLastProcessed();

    // If last processed is NULL, take oldest timestamp from electricity raw entities related to meter-node.
    if ($last_processed) {
      // If last-processed field was found, advance one second forward, so as
      // not to compute the last entity that was computed last time.
      $last_processed++;
      self::debugMessage("last processed advanced to: $last_processed (@time_from)", 1, $last_processed);
    }
    else {
      // No last-processed value. Take the date-time of the oldest entity.
      $last_processed = \NegaWattNormalizerDataProviderBase::getOldestRawElectricityEntity($this->getMeterNode(), $frequency);
      self::debugMessage("last processed set from oldest raw: $last_processed (@time_from)", 1, $last_processed);
    }

    // Get number of raw entities.
    $num_raw_entities = \NegaWattNormalizerDataProviderBase::getNumberOfRawElectricityEntities($this->getMeterNode(), $frequency);
    if ($num_raw_entities == 0) {
      if ($frequency == $this->getMeterMaxFrequency()) {
        // No raw entities for this frequency, and we're at the highest frequency.
        // If there are no normalized entities as well, there's nothing to calc.
        $num_normalized_entities = \NegaWattNormalizerDataProviderBase::getNumberOfNormalizedElectricityEntities($this->getMeterNode(), $frequency);
        // No normalized entities neither, nothing to do here.
        if (!$num_normalized_entities) {
          self::debugMessage("No raw nor normalized entities to process, leaving processByFrequency.", 1);
          return array(
            'entities' => array(),
            'last_processed' => NULL,
          );
        }
      }
      else {
        // No entities for this frequency, but we're NOT at the highest frequency,
        // take time interval from higher frequency.
        $from_timestamp = $last_processed ? $last_processed : \NegaWattNormalizerDataProviderBase::getOldestNormalizedElectricityEntity($this->getMeterNode(), $frequency + 1);
        $to_timestamp = \NegaWattNormalizerDataProviderBase::getLatestNormalizedElectricityEntity($this->getMeterNode(), $frequency + 1);
        // Increase end-timestamp so the last entity will be calculated
        // (the loop in processNormalizedEntities() is for timestamps that are
        // *smaller* then the end-timestamp)
        $to_timestamp++;
      }
    }

    list($from_timestamp, $to_timestamp) = $this->getTimeManager()->getTimePeriod($from_timestamp, $to_timestamp, $last_processed);

    // @fixme: handle the case where we have a small time-span of high frequency
    // raw date (e.g. minutes), but a long time-span of lower frequency (e.g. months).
    if ($num_raw_entities) {
      // Has raw entities (probably processing max frequency),
      // analyze data from raw entities.
      return self::processRawEntities($from_timestamp, $to_timestamp, $frequency);
    }

    // Processing lower frequency, analyze data from normalized data.
    return self::processNormalizedEntities($from_timestamp, $to_timestamp, $frequency);
  }

  /**
   * Process normalized entities in a certain time frame.
   *
   * Process normalized-electricity entities of a high frequency (e.g. minutes),
   * between two given timestamps, to create the appropriate normalized-electricity
   * entities in a lower frequency (e.g. hours).
   *
   * @param int $from_timestamp
   *    Timestamp of beginning of time frame.
   * @param int $to_timestamp
   *    Timestamp of end of time frame.
   * @param int $frequency
   *    Current frequency.
   *
   * @return array
   *    The processed normalized entities in the form array[timestamp][rate-type] = entity.
   */
  public function processNormalizedEntities($from_timestamp, $to_timestamp, $frequency) {
    // Output debug message.
    self::debugMessage('in processNormalizedEntities.', 2);
    self::debugMessage(format_string('frequency: @frequency, time-frame: [@time_from,@time_to]', array('@frequency' => \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequency))),
      2, $from_timestamp, $to_timestamp);

    // Start from the last time-slice, and loop backwards for all time-slices in time period.
    $processed_entities = array();
    $loop_end_timestamp = $to_timestamp;
    do {
      $loop_beginning_timestamp = $this->getTimeManager()->getTimeFrameBoundary($frequency, $loop_end_timestamp);

      // Output debug message.
      self::debugMessage('time-frame: [@time_from,@time_to]', 3, $loop_beginning_timestamp, $loop_end_timestamp);

      // Process the normalized entities.
      $period_entities = self::calcNormalizedValues($loop_beginning_timestamp, $loop_end_timestamp, $frequency);
      // Collect all processed entities (if there are any...).
      if ($period_entities) {
        $processed_entities[$loop_beginning_timestamp] = $period_entities;
      }
      // Prepare for next time slice.
      $loop_end_timestamp = $this->getTimeManager()->getNextTimeSlice($frequency, $loop_beginning_timestamp, $loop_end_timestamp);
    } while ($loop_end_timestamp > $from_timestamp);

    // Return processed entities and last processed timestamp (the end of time period).

    // The last timestamp processed is the timestamp of first iteration (iterating from end to beginning).
    $last_processed = NULL;
    if ($processed_entities) {
      $timestamps = array_keys($processed_entities);
      $last_processed = $timestamps[0];
    }

    return array(
      'entities' => $processed_entities,
      'last_processed' => $last_processed,
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processRawEntity($record, $prev_record) {
    // Set TOUse rate-type if necessary
    if (empty($record->rate_type)) {
      $record->rate_type = $this->calcTouseRateType($record->timestamp)->rate_type;
    }

    return $record;
  }

  /**
   * Process raw entities in a certain time frame.
   *
   * Process raw-electricity entities between two given timestamps, and create
   * the appropriate normalized-electricity entities.
   *
   * @param int $from_timestamp
   *    Timestamp of beginning of time frame.
   * @param int $to_timestamp
   *    Timestamp of end of time frame.
   * @param int $frequency
   *    Current frequency.
   *
   * @return array
   *    The processed normalized entities in the form array[timestamp][rate-type] = entity.
   */
  public function processRawEntities($from_timestamp, $to_timestamp, $frequency) {
    // Output debug message.
    self::debugMessage('in processRawEntities.', 2);
    self::debugMessage(format_string('frequency: @frequency, time-frame: [@time_from,@time_to]', array('@frequency' => \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequency))),
      2, $from_timestamp, $to_timestamp);

    // Create data provider.
    $data_provider = $this->getDataProviderManager()->createDataProvider($from_timestamp, $to_timestamp, $frequency, $this->getMeterNode());

    // Get data from raw table.
    $result = $data_provider->getDataFromRawTable();

    // Loop for received rate types and save the entities.
    $processed_entities = array();
    $prev_record = $data_provider->getRawEntityBefore();
    $prev_time_delta = NULL;
    foreach ($result as $record) {
      // Allow the sub-classed meter-normalizer to process the data
      $processed_record = $this->processRawEntity($record, $prev_record);

      // Calc time difference from last entity, in hours.
      $time_delta = ($prev_record && $prev_record->timestamp) ? ($processed_record->timestamp - $prev_record->timestamp) / 60.0 / 60 : NULL;
      // When having several raw entities from the same time period (with
      // different rate types), delta time will be set to 0 on the 2nd iteration
      // and on. In such cases, use previous delta time.
      $time_delta = $time_delta ? $time_delta : $prev_time_delta;

      // Calc average power at entity's time slice.
      // Note that for the first raw entity for a meter, there's no 'previous
      // timestamp', hence the average power cannot be computed.
      $avg_power = $time_delta ? ($processed_record->kwh / $time_delta) : NULL;

      // Set entity's values.
      $normalized_entity = $data_provider->saveNormalizedEntity($processed_record->timestamp, $frequency, $processed_record->rate_type, $processed_record->power_factor, $avg_power, $processed_record->kwh);

      $processed_entities[$processed_record->timestamp][$processed_record->rate_type] = $normalized_entity;

      // Save record and time-delta for next iteration.
      $prev_record = $record;
      $prev_time_delta = $time_delta;

      // Output debug message.
      self::debugMessage("rate-type: $processed_record->rate_type, time-stamp: @time_from, sum-kwh: $processed_record->kwh", 3, $processed_record->timestamp);
    }

    // The last timestamp processed is the timestamp of last iteration.
    $last_processed = $prev_record ? $prev_record->timestamp : NULL;

    // Output debug message.
    self::debugMessage(format_string('total entities: @count, last processed: @time_from', array('@count' => count($processed_entities))), 3, $last_processed);

    return array(
      'entities' => $processed_entities,
      'last_processed' => $last_processed,
    );
  }

  /**
   * Calculate normalized entities.
   *
   * Calculate the normalized electricity entities for frequency that is NOT
   * the maximal allowed frequency for that meter. For example, if the max
   * frequency is HOUR, than this function will calc the DAILY normalized
   * entities from the hourly ones.
   *
   * @param int $from_timestamp
   *    Timestamp of beginning of time-frame.
   * @param int $to_timestamp
   *    Timestamp of end of time-frame.
   * @param int $frequency
   *    Current frequency.
   *
   * @return array
   *    The normalized entities, or empty array if there were none.
   */
  public function calcNormalizedValues($from_timestamp, $to_timestamp, $frequency) {
    // Find the frequency to look for. Take one frequency level higher than
    // current, e.g. if current frequency is MONTH, take DAY.
    $required_frequency = $frequency + 1;

    // Create data provider.
    $data_provider = $this->getDataProviderManager()->createDataProvider($from_timestamp, $to_timestamp, $required_frequency, $this->getMeterNode());

    // Make sure there are entities in the required range
    $count = $data_provider->countEntitiesInNormalizedTable();

    if (!$count) {
      // Nothing to do.
      return array();
    }

    // Output debug message.
    self::debugMessage(format_string("in calcNormalizedValues. required frequency: @frequency, entities: $count", array('@frequency' => \NegaWattNormalizerTimeManagerBase::frequencyToStr($required_frequency))), 3);

    // Get data from normalized table.
    $result = $data_provider->getDataFromNormalizedTable();

    // Output debug message.
    self::debugMessage('After groupBy(rate_type)', 3);

    // Loop for received rate types and save the entities.
    $processed_entities = array();
    foreach ($result as $record) {
      // Prepare entity of normalized values.
      $normalized_entity = $data_provider->saveNormalizedEntity($from_timestamp, $frequency, $record->rate_type, $record->min_power_factor, $record->avg_power, $record->sum_kwh);
      $processed_entities[$record->rate_type] = $normalized_entity;

      // Output debug message.
      self::debugMessage("rate-type: $record->rate_type, sum-kwh: $record->sum_kwh", 4);
    }

    return $processed_entities;
  }

  /**
   * Output debug message, either through drush_log or debug.
   *
   * @param $message
   *    The message to output. Can use @time_from, @time_to as placeholders.
   * @param int $indentation
   *    Message indentation. That number of spaces will precede the message string.
   * @param null $time_from
   *    Timestamp. Will be converted to text and replace @time_from placeholder.
   * @param null $time_to
   *    Timestamp. Will be converted to text and replace @time_to placeholder.
   */
  public static function debugMessage($message, $indentation = 0, $time_from = NULL, $time_to = NULL) {

    // Prepare message string.
    $options = array(
      '@time_from' => date('Y-m-d H:i', $time_from),
      '@time_to' => date('Y-m-d H:i', $time_to),
    );
    $message = str_repeat(' ', $indentation) . format_string($message, $options);

    // Output message.
    if (drupal_is_cli()) {
      drush_log($message);
    }
    else {
      debug($message);
    }
  }

  // TOUse calculation tables.

  protected $touse_seasons = array(
    // Effective to 2099-1-1
    4070908800 => array(
      // To month -> season
      3 => 'winter',
      7 => 'transition',
      9 => 'summer',
      12 => 'transition',
      13 => 'winter',
    ),
  );

  protected $touse_rate_types = array(
    // Effective to 2099-1-1
    4070908800 => array(
      'summer' => array(
        // Normal day
        1 => array(
          // To hour -> rate_type
          7 => 'low',
          10 => 'mid',
          17 => 'peak',
          21 => 'mid',
          25 => 'low',
        ),
        // Friday
        2 => array(
          // To hour -> rate_type
          25 => 'low',
        ),
        // Saturday
        3 => array(
          // To hour -> rate_type
          25 => 'low',
        ),
      ),
      'winter' => array(
        // Normal day
        1 => array(
          // To hour -> rate_type
          6 => 'low',
          8 => 'mid',
          16 => 'low',
          22 => 'peak',
          25 => 'low',
        ),
        // Friday
        2 => array(
          // To hour -> rate_type
          16 => 'low',
          20 => 'mid',
          25 => 'low',
        ),
        // Saturday
        3 => array(
          // To hour -> rate_type
          17 => 'low',
          19 => 'peak',
          21 => 'mid',
          25 => 'low',
        ),
      ),
      'transition' => array(
        // Normal day
        1 => array(
          // To hour -> rate_type
          6 => 'low',
          20 => 'peak',
          22 => 'mid',
          25 => 'low',
        ),
        // Friday
        2 => array(
          // To hour -> rate_type
          6 => 'low',
          20 => 'mid',
          25 => 'low',
        ),
        // Saturday
        3 => array(
          // To hour -> rate_type
          17 => 'low',
          21 => 'mid',
          25 => 'low',
        ),
      ),
    ),
  );

  // Not including 18% VAT
  protected $touse_rates = array(
    // Effective to 2099-1-1
    4070908800 => array(
      // Rate class: TOUse low voltage
      3 => array(
        'summer' => array(
          'peak' => 1.3008,
          'mid' => 0.5629,
          'low' => 0.3734,
        ),
        'winter' => array(
          'peak' => 1.1878,
          'mid' => 0.7010,
          'low' => 0.4094
        ),
        'transition' => array(
          'peak' => 0.5480,
          'mid' => 0.4462,
          'low' => 0.3596,
        ),
      ),
      // Rate class: TOUse high voltage
      4 => array(

      ),
      // Rate class: TOUse supra-high voltage
      5 => array(

      ),
      // Rate class: TOUse choice
      6 => array(

      ),
    )
  );

}

