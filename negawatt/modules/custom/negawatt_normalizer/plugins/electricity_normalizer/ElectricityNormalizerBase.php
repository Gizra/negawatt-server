<?php

/**
 * @file
 * Contains ElectricityNormalizerBase.
 */

abstract class ElectricityNormalizerBase implements \ElectricityNormalizerInterface {

  /**
   * Rate-type constant, peak rate.
   */
  const PEAK = 'peak';

  /**
   * Rate-type constant, middle rate.
   */
  const MID = 'mid';

  /**
   * Rate-type constant, low rate.
   */
  const LOW = 'low';

  /**
   * Rate-type constant for non-TOUse rate.
   */
  const FLAT = 'flat';


  /**
   * The meter node.
   *
   * @var stdClass
   */
  protected $meterNode = NULL;

  /**
   * The frequency for normalization, e.g. HOUR.
   *
   * @var string
   */
  protected $frequency = NULL;

  /**
   * Unix timestamp of the beginning of time period to normalize.
   *
   * @var int
   */
  protected $timestampBeginning = NULL;

  /**
   * Unix timestamp of the end of time period to normalize.
   *
   * @var int
   */
  protected $timestampEnd = NULL;

  /**
   * Rate type, e.g. PEAK, LOW.
   *
   * @var string
   */
  protected $rateType = NULL;

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
  }

  /**
   * Set the frequency for normalization.
   *
   * @param string $frequency
   *    The normalizer frequency, e.g. MONTH.
   */
  public function setFrequency($frequency) {
    $this->frequency = $frequency;
  }

  /**
   * Get the frequency for normalization.
   *
   * @return string
   *    Normalizer frequency, e.g. MONTH.
   */
  public function getFrequency() {
    return $this->frequency;
  }

  /**
   * Set the timestamp of the end of time period to normalize.
   *
   * @param int $timestamp
   *    The timestamp of the end of the time period to normalize.
   */
  public function setTimestampEnd($timestamp) {
    $this->timestampEnd = $timestamp;
    // Reset also timestampBeginning so it'll be recalculated on next call to getTimestampBeginning().
    $this->timestampBeginning = NULL;
  }

  /**
   * Get the timestamp of the end of time period to normalize.
   *
   * @return int
   *    The timestamp of the end of the time period to normalize.
   */
  public function getTimestampEnd() {
    return $this->timestampEnd;
  }

  /**
   * Set the timestamp of the beginning of time period to normalize.
   *
   * USE WITH CAUTION: Usually you shouldn't call this function since
   * getTimestampBeginning() automatically calculates beginning timestamp
   * from end timestamp and frequency.
   *
   * @param int $timestamp
   *    The timestamp of the beginning of the time period to normalize.
   */
  public function setTimestampBeginning($timestamp) {
    $this->timestampBeginning = $timestamp;
  }

  /**
   * Get the timestamp of the beginning of time period to normalize.
   *
   * If not set yet, will calculate the timestamp from the timestampEnd and frequency.
   *
   * @throws Exception if can't figure out the frequency.
   *
   * @return int
   *    The timestamp of the beginning of the time period to normalize.
   */
  public function getTimestampBeginning() {
    // Was timestampBeginning already computed?
    if ($this->timestampBeginning) {
      return $this->timestampBeginning;
    }

    // timestampBeginning was not calculated yet. Take the beginning of time-frame
    // (according to $this->getFrequency()), from timestampEnd backwards.
    $this->timestampBeginning = $this->getTimeFrameBoundary($this->timestampEnd);
    return $this->timestampBeginning;
  }

  /**
   * Set the timestamp of the beginning and end of time period to normalize.
   *
   * @param int $fromTimestamp
   *    The timestamp of the beginning of the time period to normalize.
   * @param int $toTimestamp
   *    The timestamp of the ebd of the time period to normalize.
   */
  public function setTimestampFromTo($fromTimestamp, $toTimestamp) {
    $this->timestampBeginning = $fromTimestamp;//$this->getTimeFrameBoundary($fromTimestamp);
    $this->timestampEnd = $toTimestamp;
  }

  /**
   * Get the rate type, e.g. PEAK, LOW.
   *
   * @return string
   *    Rate-type.
   */
  public function getRateType() {
    return $this->rateType;
  }

  /**
   * Set the rate type, e.g. PEAK, LOW.
   *
   * @param string $rateType
   *    The rate-type.
   */
  public function setRateType($rateType) {
    $this->rateType = $rateType;
  }

  /**
   * Get the timestamp of the beginning of time period to normalize.
   *
   * If not set yet, will calculate the timestamp from the timestampEnd and frequency.
   *
   * @param $timestamp
   *    Reference timestamp to calculate time-frame boundary.

   * @return int
   *    Timestamp of time-frame boundary.
   *
   * @throws Exception
   *    if can't figure out the frequency.
   */
  public function getTimeFrameBoundary($timestamp) {
    // Create DateTime object to calculate the beginning of time period.
    $date_time = new \DateTime();
    $date_info = getdate($timestamp);
    switch ($this->frequency) {
      case \ElectricityNormalizerInterface::MINUTE: {
        // Take the beginning of the previous minute.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday']);
        $hour = $date_info['hours'];
        // If timestampEnd was set to exact minute, go back one minute, otherwise go back to beginning of minute.
        $minute = (0 == $date_info['seconds']) ? ($date_info['minutes'] - 1) : $date_info['minutes'];
        $date_time->setTime($hour, $minute, 0);
        break;
      }
      case \ElectricityNormalizerInterface::HOUR: {
        // Take the beginning of the previous hour.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday']);
        // If timestampEnd was set to exact hour, go back one hour, otherwise go back to beginning of hour.
        $hour = (0 == $date_info['minutes'] && 0 == $date_info['seconds']) ? ($date_info['hours'] - 1) : $date_info['hours'];
        $date_time->setTime($hour, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::DAY: {
        // Take the beginning of the previous day.
        // If timestampEnd was set to beginning of the day, go back one day, otherwise go back to beginning of the day.
        $day = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds']) ? ($date_info['mday'] - 1) : $date_info['mday'];
        $date_time->setDate($date_info['year'], $date_info['mon'], $day);
        $date_time->setTime(0, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::MONTH: {
        // Take the beginning of the 1st day of the previous month.
        // If timestampEnd was set to beginning of the month, go back one month, otherwise go back to beginning of the month.
        $month = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds'] && 1 == $date_info['mday']) ?
          ($date_info['mon'] - 1) : $date_info['mon'];
        $date_time->setDate($date_info['year'], $month, 1);
        $date_time->setTime(0, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::YEAR: {
        // Take the beginning of the 1st day of the previous year.
        // If timestampEnd was set to beginning of the month, go back one month, otherwise go back to beginning of the month.
        $year = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds'] && 0 == $date_info['yday']) ?
          ($date_info['year'] - 1) : $date_info['year'];
        $date_time->setDate($year, 1, 1);
        $date_time->setTime(0, 0, 0);
        break;
      }
      default: {
        // Not a known frequency.
        throw new \Exception(format_string('Cannot figure out frequency "@frequency".', array('@frequency' => self::frequencyToStr($this->frequency))));
      }
    }
    return $date_time->getTimestamp();
  }

  /**
   * Return the timestamp of the oldest raw-electricity entity for the
   * current meter node.
   *
   * If no entity exists, return "now".
   */
  public function getOldestRawElectricityEntity() {
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity_raw')
      ->propertyCondition('meter_nid', $this->getMeterNode()->nid)
      ->propertyOrderBy('timestamp')
      ->range(0, 1)
      ->execute();

    // No entity was found, take current time.
    if (empty($result['electricity_raw'])) {
      return time();
    }

    $id = key($result['electricity_raw']);
    $entity = entity_load_single('electricity_raw', $id);
    return $entity->timestamp;
  }

  /**
   * The timestamp of raw entity before a given time.
   *
   * The function returns the timestamp of the raw-electricity entity for
   * the current meter node, that is immediately before a given timestamp.
   *
   * @param $timestamp
   *    Reference timestamp.
   *
   * @return null | int
   *    The timestamp of the entity before, or NULL.
   */
  protected function getTimestampOfRawEntitiesBefore($timestamp) {
    $query = db_select('negawatt_electricity', 'ne')
      ->fields('ne', array('timestamp'))
      ->condition('timestamp', $timestamp, '<')
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->range(0, 1)
      ->orderBy('timestamp', 'DESC');

    $result = $query->execute()->fetchObject();

    // If result is false, return NULL, otherwise return timestamp
    return $result ? $result->timestamp : NULL;
  }

  /**
   * Class constructor.
   *
   * @param array $plugin
   *   The plugin definition array.
   */
  public function __construct(array $plugin) {
    $this->plugin = $plugin;
  }

  /**
   * {@inheritdoc}
   */
  public function process($node, $frequencies = array(), $time_period = array()) {
    $this->setMeterNode($node);

    // If frequencies was empty, set it to all allowed frequencies.
    $allowed_frequencies = $this->getAllowedFrequencies();
    $frequencies = empty($frequencies) ? $allowed_frequencies : $frequencies;

    // If not time period is given, use '-', otherwise use '<from-date>-<to-date>'.
    $time_period_str = empty($time_period) ? '-' : ( date('Y-m-d H:i', $time_period[0]) . ',' . date('Y-m-d H:i', $time_period[1]) );

    // Output debug message.
    self::debugMessage(format_string('frequencies: [@frequencies],', array('@frequencies' => implode(',', self::frequencyToStr($frequencies)))), 1);
    self::debugMessage("time-frame: [$time_period_str].", 1);

    $processed_entities = array();
    $last_processed = 0;
    foreach ($frequencies as $frequency) {
      // Make sure frequency is valid.
      if (!in_array($frequency, $allowed_frequencies)) {
        throw new \Exception(format_string('Frequency "@freq" not in allowed frequencies.', array('@freq' => self::frequencyToStr($frequency))));
      }

      $result = $this->processByFrequency($frequency, $time_period);
      $last_processed = max($last_processed, $result['last_processed']);
      $processed_entities = array_merge($processed_entities, $result['entities']);

      if (empty($processed_entities)) {
        // Nothing was found, no point in processing lower frequencies.
        self::debugMessage('No entity was returned, ending process().', 1);
        break;
      }
    }

    // Output debug message.
    self::debugMessage(format_string('@count entities returned.', array('@count' => count($processed_entities))), 1);

    // Generate message.
    // Prepare arguments.
    $arguments = array(
      '@frequencies' => implode(',', self::frequencyToStr($frequencies)),
      '@time_period' => $time_period_str,
      '@entities' => count($processed_entities),
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
    $wrapper->save();

    return $processed_entities;
  }

  /**
   * Process entities by one frequency.
   *
   * Called from ElectricityNormalizerBase::process() for each frequency.
   * Node, and timestampEnd should have been set by caller.
   *
   * @param string $frequency
   *    The frequency to use (HOUR, MONTH, etc.).
   * @param array $time_period
   *    Beginning and end of time period to process.
   * @throws Exception if $time_period end is before beginning.
   *
   * @return array
   *    [entities]: An array of the processed entities, or empty array if there were no values to process.
   *    [last_processed]: updated value for last processed node field. Caller should save this value.
   */
  protected function processByFrequency($frequency, $time_period = array()) {
    $this->setFrequency($frequency);

    // Loop over all the time slices and process them one by one using processByTimePeriod

    // Get last processed timestamp from meter node.
    $wrapper = entity_metadata_wrapper('node', $this->getMeterNode());
    $last_processed = $wrapper->field_last_processed->value();

    // If last processed is NULL, take oldest timestamp from electricity raw entities related to meter-node.
    if ($last_processed) {
      // If last-processed field was found, advance one second forward, so as
      // not to compute the last entity that was computed last time.
      $last_processed++;
      self::debugMessage("last processed advanced to: $last_processed (@time_from)", 1, $last_processed);
    }
    else {
      // No last-processed value. Take the date-time of the oldest entity.
      $last_processed = $this->getOldestRawElectricityEntity();
      self::debugMessage("last processed set from oldest raw: $last_processed (@time_from)", 1, $last_processed);
    }

    // Prepare time period beginning and end.
    if (empty($time_period)) {
      $time_period = array(NULL, NULL);
    }

    if (!$time_period[0]) {
      // Beginning of time period default to last processed.
      $time_period[0] = $last_processed;
    }
    if (!$time_period[1]) {
      // End of time period default to now.
      $time_period[1] = time();
    }

    // Sanity check on time period.
    if ($time_period[1] < $time_period[0]) {
      $params = array(
        '@begin' => date('Y-m-d H:i', $time_period[0]),
        '@end' => date('Y-m-d H:i', $time_period[1]),
      );
      throw new \Exception(format_string('Time period ends before it starts: beginning = @begin, end = @end.', $params));
    }

    $meter_max_frequency = $wrapper->field_max_frequency->value();
    if ($frequency == $meter_max_frequency) {
      // Processing max frequency, analyze data from raw data.
      return $this->processRawEntities($time_period[0], $time_period[1]);
    }

    // Processing lower frequency, analyze data from normalized data.
    return $this->processNormalizedEntities($time_period[0], $time_period[1]);
  }

  /**
   * Process raw entities in a certain time frame.
   *
   * Process raw-electricity entities between two given timestamps, and create
   * the appropriate normalized-electricity entities.
   *
   * @param $fromTimestamp
   *    Timestamp of beginning of time frame.
   * @param $toTimestamp
   *    Timestamp of end of time frame.
   * @return array
   *    The processed normalized entities.
   */
  protected function processRawEntities($fromTimestamp, $toTimestamp) {

    $this->setTimestampFromTo($fromTimestamp, $toTimestamp);

    // Output debug message.
    self::debugMessage('in processRawEntities.', 2);
    self::debugMessage(format_string('frequency: @frequency, time-frame: [@time_from,@time_to]', array('@frequency' => self::frequencyToStr($this->getFrequency()))),
      2, $fromTimestamp, $toTimestamp);

    // Get data from raw table.
    $query = $this->getQueryForNormalizedValues();
    $query->fields('ne', array('timestamp', 'rate_type', 'kwh', 'power_factor'));
    $result = $query->execute();

    // Loop for received rate types and save the entities.
    $processed_entities = array();
    $prev_timestamp = $this->getTimestampOfRawEntitiesBefore($fromTimestamp);
    $prev_time_delta = NULL;
    foreach ($result as $record) {
      $this->setRateType($record->rate_type);
      $this->setTimestampBeginning($record->timestamp);

      // Prepare entity of normalized values.
      $wrapper = entity_metadata_wrapper('electricity', $this->getNormalizedEntity());

      // Calc time difference from last entity, in hours.
      $time_delta = $prev_timestamp ? ($record->timestamp - $prev_timestamp) / 60.0 / 60 : NULL;
      // When having several raw entities from the same time period (with
      // different rate types), delta time will be set to 0 on the 2nd iteration
      // and on. In such cases, use previous delta time.
      $time_delta = $time_delta ? $time_delta : $prev_time_delta;

      // Save timestamp and time-delta for next iteration.
      $prev_timestamp = $record->timestamp;
      $prev_time_delta = $time_delta;

      // Calc average power at entity's time slice.
      // Note that for the first raw entity for a meter, there's no 'previous
      // timestamp', hence the average power cannot be computed.
      $avg_power = $time_delta ? ($record->kwh / $time_delta) : NULL;

      // Set entity's values.
      $wrapper->min_power_factor->set($record->power_factor);
      $wrapper->avg_power->set($avg_power);
      $wrapper->sum_kwh->set($record->kwh);

      $wrapper->save();
      $processed_entities[] = $wrapper->value();

      // Output debug message.
      self::debugMessage("rate-type: $record->rate_type, time-stamp: @time_from, sum-kwh: $record->kwh", 3, $this->getTimestampBeginning());
    }

    // The last timestamp processed is the timestamp of last iteration
    $last_processed = $prev_timestamp;

    // Output debug message.
    self::debugMessage(format_string('total entities: @count, last processed: @time_from', array('@count' => count($processed_entities))), 3, $last_processed);

    return array(
      'entities' => $processed_entities,
      'last_processed' => $last_processed,
    );
  }

  /**
   * Generate the end-timestamp for the next time slice in processNormalizedEntities()
   *
   * Time slices go backwards, from end timestamp to the beginnings.
   * For year, month, and day frequencies, use $this->getTimestampBeginning.
   * For minute and hour, subtract the number of seconds from $this->timestampEnd.
   * This is because when switching from winter to summer clock, using
   * $date_time->setTime, as in getTimestampBeginning, will repeat the same hour again!
   *
   * @return int
   *  The end-timestamp for next time slice.
   */
  protected function getNextTimeSlice() {
    switch ($this->getFrequency()) {

      case \ElectricityNormalizerInterface::MINUTE: {
        // 'hard' retrace to minute boundary to avoid problems with daylight saving time change.
        // Retrace the number of seconds until previous minute boundary.
        $timestamp = $this->getTimestampEnd() - 1;
        return $timestamp - ($timestamp % 60);
      }
      case \ElectricityNormalizerInterface::HOUR: {
        // 'hard' retrace to hour (3600 seconds) boundary (see comment above).
        $timestamp = $this->getTimestampEnd() - 1;
        return $timestamp - ($timestamp % 3600);
      }
      default:
        // use DateTime::setTime() and setDate() since day interval and higher
        // will not be affected by daylight saving time change.
        return $this->getTimestampBeginning();
    }
  }

  /**
   * Process normalized entities in a certain time frame.
   *
   * Process normalized-electricity entities of a high frequency (e.g. minutes),
   * between two given timestamps, to create the appropriate normalized-electricity
   * entities in a lower frequency (e.g. hours).
   *
   * @param $fromTimestamp
   *    Timestamp of beginning of time frame.
   * @param $toTimestamp
   *    Timestamp of end of time frame.
   * @return array
   *    The processed normalized entities.
   * @throws Exception
   */
  protected function processNormalizedEntities($fromTimestamp, $toTimestamp) {
    // Output debug message.
    self::debugMessage('in processNormalizedEntities.', 2);
    self::debugMessage(format_string('frequency: @frequency, time-frame: [@time_from,@time_to]', array('@frequency' => self::frequencyToStr($this->getFrequency()))),
      2, $fromTimestamp, $toTimestamp);

    // Start from the last time-slice, and loop backwards for all time-slices in time period.
    $processed_entities = array();
    $prev_period_entities = array();
    $this->setTimestampEnd($toTimestamp);
    do {
      // Output debug message.
      self::debugMessage('time-frame: [@time_from,@time_to]', 3, $this->getTimestampBeginning(), $this->getTimestampEnd());

      // Process the normalized entities.
      $period_entities = $this->calcNormalizedValues();
      // Analyze resulting entities for anomalies
      $this->analyzeEntitiesFromConsecutiveTimeSlices($prev_period_entities, $period_entities);
      $prev_period_entities = $period_entities;
      // Collect all processed entities.
      $processed_entities = array_merge($processed_entities, $period_entities);
      // Prepare for next time slice.
      $this->setTimestampEnd($this->getNextTimeSlice());
    } while ($this->getTimeStampEnd() > $fromTimestamp);

    // Return processed entities and last processed timestamp (the end of time period).

    // The last timestamp processed is one time frame after the timestamp of last iteration
    $last_processed = NULL;
    if (count($processed_entities)) {
      $last_processed = $processed_entities[0]->timestamp;
    }

    return array(
      'entities' => $processed_entities,
      'last_processed' => $last_processed,
    );
  }

  /**
   * Get or create the normalized entity for a time period, rate-type, frequency, and meter.
   *
   * @return StdClass
   *    The entity found (or created).
   */
  protected function getNormalizedEntity() {
    // Check if the required normalized entity exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity')
      ->propertyCondition('type', $this->getFrequency())
      ->propertyCondition('meter_nid', $this->getMeterNode()->nid)
      ->propertyCondition('timestamp', $this->getTimestampBeginning())
      ->propertyCondition('rate_type', $this->getRateType())
      ->range(0, 1)
      ->execute();
    if (!empty($result['electricity'])) {
      // Entity was found, return it.
      $id = key($result['electricity']);
      return entity_load_single('electricity', $id);
    }

    // Entity doesn't exist yet, create a new one.
    $values = array(
      'type' => $this->getFrequency(),
      'meter_nid' => $this->getMeterNode()->nid,
      'timestamp' => $this->getTimestampBeginning(),
      'rate_type' => $this->getRateType(),
    );

    $entity = entity_create('electricity', $values);
    return $entity;
  }

  /**
   * Prepare a standard query for the raw table.
   *
   * @param string $table_name
   *    The name of the table to be queried. Defaults to 'negawatt_electricity'.
   * @return SelectQuery The Query object.
   * The Query object.
   * @throws Exception
   */
  protected function getQueryForNormalizedValues($table_name = 'negawatt_electricity') {
    $query = db_select($table_name, 'ne')
      ->condition('timestamp', $this->getTimestampBeginning(), '>=')
      ->condition('timestamp', $this->getTimestampEnd(), '<')
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->orderBy('timestamp');
    return $query;
  }

  /**
   * Calculate normalized entities.
   *
   * Calculate the normalized electricity entities for frequency that is NOT
   * the maximal allowed frequency for that meter. For example, if the max
   * frequency is HOUR, than this function will calc the DAILY normalized
   * entities from the hourly ones.
   *
   * @return array.
   *    The normalized entities, or empty array if there were none.
   * @throws Exception
   */
  protected function calcNormalizedValues() {
    // Find the frequency to look for. Take one frequency level higher than
    // current, e.g. if current frequency is MONTH, take DAY.
    $required_frequency = $this->getFrequency() + 1;

    // Make sure there are entities in the required range
    $count = $this->getQueryForNormalizedValues('negawatt_electricity_normalized')
      ->condition('type', $required_frequency)
      ->countQuery()
      ->execute()
      ->fetchField();

    // Output debug message.
    self::debugMessage(format_string("in calcNormalizedValues. required frequency: @frequency, entities: $count", array('@frequency' => self::frequencyToStr($required_frequency))), 3);

    if (!$count) {
      // Nothing to do.
      return array();
    }

    // Get data from normalized table.
    $query = $this->getQueryForNormalizedValues('negawatt_electricity_normalized');
    $query->fields('ne', array('rate_type'));
    $query->condition('type', $required_frequency);
    $query->addExpression('SUM(sum_kwh)', 'sum_kwh');
    $query->addExpression('AVG(avg_power)', 'avg_power');
    $query->addExpression('MIN(min_power_factor)', 'min_power_factor');
    $query->groupBy('rate_type');

    $result = $query->execute();

    // Output debug message.
    self::debugMessage('After groupBy(rate_type)', 3);

    // Loop for received rate types and save the entities.
    $processed_entities = array();
    foreach ($result as $record) {
      $this->setRateType($record->rate_type);

      // Prepare entity of normalized values.
      $wrapper = entity_metadata_wrapper('electricity', $this->getNormalizedEntity());

      // Set entity's values.
      $wrapper->min_power_factor->set($record->min_power_factor);
      $wrapper->avg_power->set($record->avg_power);
      $wrapper->sum_kwh->set($record->sum_kwh);

      $wrapper->save();
      $processed_entities[] = $wrapper->value();

      // Output debug message.
      self::debugMessage("rate-type: $record->rate_type, sum-kwh: $record->sum_kwh", 4);
    }

    return $processed_entities;
  }

  /**
   * The set of allowed frequencies for that meter type.
   *
   * for ElectricityNormalizerIec object - use MONTH and up.
   *
   * @return array
   *  Array of allowed frequencies for that meter type.
   */
  protected function getAllowedFrequencies() {
    // Look for maximum frequency allowed for current meter
    $wrapper = entity_metadata_wrapper('node', $this->getMeterNode());
    $return = array();
    // Prepare an array with allowed frequencies. Use fallthrough.
    switch ($wrapper->field_max_frequency->value()) {
      case \ElectricityNormalizerInterface::MINUTE:
        array_push($return, \ElectricityNormalizerInterface::MINUTE);
      case \ElectricityNormalizerInterface::HOUR:
        array_push($return, \ElectricityNormalizerInterface::HOUR);
      case \ElectricityNormalizerInterface::DAY:
        array_push($return, \ElectricityNormalizerInterface::DAY);
      case \ElectricityNormalizerInterface::MONTH:
        array_push($return, \ElectricityNormalizerInterface::MONTH);
      case \ElectricityNormalizerInterface::YEAR:
        array_push($return, \ElectricityNormalizerInterface::YEAR);
    }
    return $return;
  }

  /**
   * Analyze the processed entities from two consecutive time slices for anomalies.
   *
   * Currently checks for difference higher than +/- 10%.
   * If an anomaly found, generate a warning message.
   *
   * @param $prev_entities
   *  Array of entities from the previous time-slice.
   * @param $entities
   *  Array of entities from the current time-slice.
   */
  protected function analyzeEntitiesFromConsecutiveTimeSlices($prev_entities, $entities) {
    if (!$entities || !$prev_entities) {
      // No entities to compare, nothing to do.
      return;
    }

    // Make field 'rate_type' the prev entities array key.
    foreach ($prev_entities as $entity) {
      $prev_entities[$entity->rate_type] = $entity;
    }

    // Go through rate types, and look for anomaly.
    foreach ($entities as $entity) {
      if (isset($prev_entities[$entity->rate_type])) {
        $avg_power = $entity->avg_power;
        $prev_avg_power = $prev_entities[$entity->rate_type]->avg_power;
        $avg_power_diff = $prev_avg_power ? ($avg_power / $prev_avg_power) : 10;
        if ($avg_power_diff < 0.90 || $avg_power_diff > 1.10) {
          // Avg power difference is suspicious, put an alert
          // Prepare message arguments.
          $arguments = array(
            // @fixme: date format of 'Y-m' fits monthly data. Change according to frequency.
            '@date' => date('Y-m', $this->getTimestampBeginning()),
            '@rate_type' => $this->getRateType(),
            '@frequency' => $this->getFrequency(),
            '@cur_avg_power' => $avg_power,
            '@prev_avg_power' => $prev_avg_power,
          );
          // Generate the message.
          $node = $this->getMeterNode();
          $user_account = user_load($node->uid);
          $message = message_create('anomalous_consumption', array('arguments' => $arguments), $user_account);
          $wrapper = entity_metadata_wrapper('message', $message);
          $wrapper->field_meter->set($node);
          $wrapper->save();
        }
      }
    }
  }

  /**
   * Convert a string (or array of strings) to frequency constant(s).
   *
   * @param $str|array
   *    Input string, e.g. 'month'.
   * @return bool|int|array
   *    Appropriate frequency constant.
   * @throws Exception
   *    On unknown string.
   */
  protected static function strToFrequency($str) {
    // Handle an array of strings.
    if (is_array($str)) {
      $return = array();
      foreach ($str as $s) {
        array_push($return, strToFrequency($s));
      }
      return $return;
    }
    // Handle a single string.
    switch (strtolower($str)) {
      case 'year':
        return \ElectricityNormalizerInterface::YEAR;
      case 'month':
        return \ElectricityNormalizerInterface::MONTH;
      case 'day':
        return \ElectricityNormalizerInterface::DAY;
      case 'hour':
        return \ElectricityNormalizerInterface::HOUR;
      case 'minute':
        return \ElectricityNormalizerInterface::MINUTE;
      default:
        throw new \Exception(format_string('Frequency "@freq" not known.', array('@freq' => $str)));
    }
  }

  /**
   * Convert a frequency constant (or array thereof) to string(s).
   *
   * @param $frequency
   *    Input frequency constant.
   * @return bool|string
   *    Appropriate string, e.g. 'month'.
   * @throws Exception
   *    On unknown frequency.
   */
  protected static function frequencyToStr($frequency) {
    // Handle an array of frequencies.
    if (is_array($frequency)) {
      $return = array();
      foreach ($frequency as $f) {
        array_push($return, self::frequencyToStr($f));
      }
      return $return;
    }
    // Handle a single frequency.
    switch ($frequency) {
      case \ElectricityNormalizerInterface::YEAR:
        return 'year';
      case \ElectricityNormalizerInterface::MONTH:
        return 'month';
      case \ElectricityNormalizerInterface::DAY:
        return 'day';
      case \ElectricityNormalizerInterface::HOUR:
        return 'hour';
      case \ElectricityNormalizerInterface::MINUTE:
        return 'minute';
      default:
        throw new \Exception(format_string('Frequency "@freq" not known.', array('@freq' => $frequency)));
    }
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
  protected static function debugMessage($message, $indentation = 0, $time_from = NULL, $time_to = NULL) {

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

}

