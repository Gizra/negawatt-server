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
        // Take the beginning of the previous hour
        // @fixme: What if timestampEnd is in the middle of an hour? Current calculation will result an interval of more then a hour.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday']);
        $date_time->setTime($date_info['hours'] - 1, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::DAY: {
        // Take the beginning of the previous day at noon.
        // @fixme: What if timestampEnd is in the middle of the day? Current calculation will result an interval of more then one day.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday'] - 1);
        $date_time->setTime(12, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::WEEK: {
        // Take the beginning of the previous Sunday at noon.
        // @fixme: What if timestampEnd is on Sun. but before noon? The result interval will be negative...
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday'] - $date_info['wday']);
        $date_time->setTime(12, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::MONTH: {
        // Take the beginning of the 1st day of the previous month, at noon.
        // @fixme: What if timestampEnd is in the middle of the month? Current calculation will result an interval of more then one month.
        $date_time->setDate($date_info['year'], $date_info['mon'] - 1, 1);
        $date_time->setTime(12, 0, 0);
        break;
      }
      case \ElectricityNormalizerInterface::YEAR: {
        // Take the beginning of the 1st day of the previous year, at noon.
        // @fixme: What if timestampEnd is in the middle of the year? Current calculation will result an interval of more then one year.
        $date_time->setDate($date_info['year'] - 1, 1, 1);
        $date_time->setTime(12, 0, 0);
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
  public function process($node, $frequency, $timestamp_end = NULL) {
    $this->setMeterNode($node);
    $this->setFrequency($frequency);
    $this->setTimestampEnd($timestamp_end ? $timestamp_end : time());

    // Try to normalize values.
    if (!$values = $this->normalizeValues()) {
      // No values to normalize.
      return;
    }

    // Save returned normalized values.
    $wrapper = entity_metadata_wrapper('electricity', $this->getNormalizedEntity());

    foreach ($values as $property => $value) {
      $wrapper->{$property}->set($value);
    }

    $wrapper->save();
    return $wrapper->value();
  }

  /**
   * Get or create the normalized entity for a time period and meter.
   *
   * @return StdClass
   *  The entity found (or created).
   */
  protected function getNormalizedEntity() {
    // Check if the required normalized entity exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity')
      ->propertyCondition('meter_nid', $this->getMeterNode()->nid)
      ->propertyCondition('timestamp', $this->getTimestampBeginning())
      // @fixme: For TOUse meters, several entities will result (for peak, mid, and low rates, and maybe non-touse too).
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
      // @fixme: Consider rate type. There might be several entities for the time period with different rate types.
      'rate_type' => 'flat',
    );

    $entity = entity_create('electricity', $values);
    return $entity;
  }

  /**
   * {@inheritdoc}
   */

  public function access() {
    return TRUE;
  }

  /**
   * Normalize the required entities.
   * Must be supplied by child object.
   *
   * @return array
   *  Array of normalized values.
   */
  abstract protected function normalizeValues();

}
