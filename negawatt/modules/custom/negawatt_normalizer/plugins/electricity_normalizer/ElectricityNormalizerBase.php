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
    if ($this->timestampBeginning) {
      return $this->timestampBeginning;
    }

    // Create DateTime object to calculate the beginning of time period.
    $date_time = new \DateTime();
    $date_info = getdate($this->timestampEnd);
    switch ($this->frequency) {
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
      case \ElectricityNormalizerInterface::WEEK: {
        // Take the beginning of the previous Sunday.
        // If timestampEnd was set to beginning of the week, go back one week, otherwise go back to beginning of the week.
        $day = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds'] && 0 == $date_info['wday']) ?
          ($date_info['mday'] - $date_info['wday']) : ($date_info['mday'] - 7);
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
        $params = array(
          '@freq' => $this->frequency,
        );
        throw new \Exception(format_string('Cannot figure out frequency "@freq".', $params));
      }
    }
    $this->timestampBeginning = $date_time->getTimestamp();
    return $date_time->getTimestamp();
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
  public function process($node, $timestamp_end = NULL, $frequencies = array(), $rate_types = array()) {
    $this->setMeterNode($node);
    $this->setTimestampEnd($timestamp_end ? $timestamp_end : time());

    // If frequencies was empty, set it to all allowed frequencies.
    $allowed_frequencies = $this->getAllowedFrequencies();
    $frequencies = empty($frequencies) ? $allowed_frequencies : $frequencies;

    $processed_entities = array();
    foreach ($frequencies as $frequency) {
      // Make sure frequency is valid.
      if (!in_array($frequency, $allowed_frequencies)) {
        throw new \Exception(format_string('Frequency "@freq" not in allowed frequencies.', array('@freq', $frequency)));
      }

      $frequency_entities = $this->processByFrequency($frequency, $rate_types);
      if (empty($frequency_entities)) {
        // Don't put into result an empty array.
        continue;
      }
      $processed_entities = array_merge($processed_entities, $frequency_entities);
    }

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
   * @param array $rate_types
   *    The rate-types to use (peak, mid, etc.).
   * @throws Exception in case of unknown rate-type.
   *
   * @return array
   *    The processed entities, or empty array if there were no values to process.
   */
  public function processByFrequency($frequency, $rate_types = array()) {
    $this->setFrequency($frequency);

    $allowed_rate_types = array(
      \ElectricityNormalizerBase::PEAK,
      \ElectricityNormalizerBase::MID,
      \ElectricityNormalizerBase::LOW,
      \ElectricityNormalizerBase::FLAT,
    );

    // If $rate_types was empty, set it to all allowed rate-types.
    $rate_types = empty($rate_types) ? $allowed_rate_types : $rate_types;

    $processed_entities = array();
    foreach ($rate_types as $rate_type) {
      // Make sure $rate_type is valid.
      if (!in_array($rate_type, $allowed_rate_types)) {
        throw new \Exception(format_string('Rate type "@rate" not in allowed rate types.', array('@type' => $rate_type)));
      }

      $processed_entity = $this->processByRateType($rate_type);
      if (!$processed_entity) {
        // Don't put into result a NULL entity.
        continue;
      }
      $processed_entities[] = $processed_entity;
    }

    return $processed_entities;
  }

  /**
   * Do the actual processing of one entity.
   *
   * Called from ElectricityNormalizerBase::process() for each rate-type.
   * Node, frequency, and timestampEnd should all have been set by caller.
   *
   * @param string $rate_type
   *    The rate-type to use (peak, mid, etc.).
   *
   * @return stdClass
   *    The processed entity, or NULL if there were no values to process.
   */
  protected function processByRateType($rate_type) {
    $this->setRateType($rate_type);

    // Try to normalize values.
    if (!$values = $this->getNormalizedValues()) {
      // No values to normalize.
      return;
    }

    // Prepare entity of normalized values.
    $wrapper = entity_metadata_wrapper('electricity', $this->getNormalizedEntity());

    foreach ($values as $property => $value) {
      $wrapper->{$property}->set($value);
    }

    $wrapper->save();
    return $wrapper->value();
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
   * @return SelectQuery
   *    The Query object.
   */
  protected function getQueryForNormalizedValues() {
    $query = db_select('negawatt_electricity', 'ne')
      ->condition('timestamp', $this->getTimestampBeginning(), '>=')
      ->condition('timestamp', $this->getTimestampEnd(), '<')
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->condition('rate_type', $this->getRateType());
    return $query;
  }

  /**
   * Normalize the required entities.
   *
   * Must be supplied by child object.
   *
   * @return array
   *  Array of normalized values.
   */
  abstract protected function getNormalizedValues();

  /**
   * The set of allowed frequencies for that meter type.
   *
   * Must be supplied by child object.
   *
   * @return array
   *  Array of allowed frequencies for that meter type.
   */
  abstract protected function getAllowedFrequencies();
}
