<?php


/**
 * @file
 * Contains NegaWattNormalizerDataProviderBase.
 */

class NegaWattNormalizerDataProviderBase implements \NegaWattNormalizerDataProviderInterface {

  /**
   * Time-frame beginning timestamp.
   *
   * @var int
   */
  protected $timestampFrom = 0;

  /**
   * Time-frame end timestamp.
   *
   * @var int
   */
  protected $timestampTo = 0;

  /**
   * Time-frame frequency.
   *
   * @var int
   */
  protected $frequency = 0;

  /**
   * Meter node.
   *
   * @var StdClass
   */
  protected $meterNode = NULL;


  /**
   * Get the time-frame beginning timestamp.
   *
   * @return int
   *    The timestamp.
   */
  public function getTimestampFrom() {
    return $this->timestampFrom;
  }

  /**
   * Get the time-frame end timestamp.
   *
   * @return int
   *    The timestamp.
   */
  public function getTimestampTo() {
    return $this->timestampTo;
  }

  /**
   * Get the time-frame frequency.
   *
   * @return int
   *    The frequency.
   */
  public function getFrequency() {
    return $this->frequency;
  }

  /**
   * Get the meter node.
   *
   * @return StdClass
   *    The meter node.
   */
  public function getMeterNode() {
    return $this->meterNode;
  }

  /**
   * {@inheritdoc}
   */
  public function __construct($from_timestamp, $to_timestamp, $frequency, $node) {
    $this->timestampFrom = $from_timestamp;
    $this->timestampTo = $to_timestamp;
    $this->frequency = $frequency;
    $this->meterNode = $node;
    if (!is_object($node)) {
      // Node-ID was given. Load the node itself.
      $this->meterNode = load_node($node);
    }
  }


  /**
   * Prepare the base query for raw electricity entities.
   *
   * @param $node
   *    Meter node.
   * @param $frequency
   *    Required frequency.
   * @param string $entity_type
   *    Entity type.
   *
   * @return EntityFieldQuery
   *    A new base query.
   */
  public static function getElectricityEntitiesQuery($node, $frequency, $entity_type = 'electricity_raw') {
    $query = new EntityFieldQuery();
    return $query
      ->entityCondition('entity_type', $entity_type)
      ->propertyCondition('meter_nid', $node->nid)
      ->propertyCondition('frequency', $frequency);
  }

  /**
   * Get the timestamp of first entity in result.
   *
   * @param $result
   *    A EntityFieldQuery result.
   * @param string $entity_type
   *    Entity type.
   *
   * @return EntityFieldQuery
   *    The entity timestamp, if one exists, otherwise NULL.
   */
  public static function timestampFromQueryResult($result, $entity_type = 'electricity_raw') {
    // No entity was found, return NULL.
    if (empty($result[$entity_type])) {
      return NULL;
    }

    $id = key($result[$entity_type]);
    $entity = entity_load_single($entity_type, $id);
    return $entity->timestamp;
  }

  /**
   * {@inheritdoc}
   */
  public static function getNumberOfRawElectricityEntities($node, $frequency) {
    $query = self::getElectricityEntitiesQuery($node, $frequency);
    return $query
      ->count()
      ->execute();
  }

  /**
   * {@inheritdoc}
   */
  public static function getNumberOfNormalizedElectricityEntities($node, $frequency) {
    $query = self::getElectricityEntitiesQuery($node, $frequency, 'electricity');
    return $query
      ->count()
      ->execute();
  }

  /**
   * {@inheritdoc}
   */
  public static function getOldestRawElectricityEntity($node, $frequency) {
    $query = self::getElectricityEntitiesQuery($node, $frequency);
    $result = $query
      ->propertyOrderBy('timestamp')
      ->range(0, 1)
      ->execute();

    return self::timestampFromQueryResult($result);
  }

  /**
   * {@inheritdoc}
   */
  public static function getOldestNormalizedElectricityEntity($node, $frequency) {
    $query = self::getElectricityEntitiesQuery($node, $frequency, 'electricity');
    $result = $query
      ->propertyOrderBy('timestamp')
      ->range(0, 1)
      ->execute();

    return self::timestampFromQueryResult($result, 'electricity');
  }

  /**
   * {@inheritdoc}
   */
  public static function getLatestNormalizedElectricityEntity($node, $frequency) {
    $query = self::getElectricityEntitiesQuery($node, $frequency, 'electricity');
    $result = $query
      ->propertyOrderBy('timestamp', 'DESC')
      ->range(0, 1)
      ->execute();

    return self::timestampFromQueryResult($result, 'electricity');
  }

  /**
   * {@inheritdoc}
   */
  public function getRawEntityBefore() {
    $query = db_select('negawatt_electricity', 'ne')
      ->fields('ne')
      ->condition('timestamp', $this->getTimestampFrom(), '<')
      ->condition('frequency', $this->getFrequency())
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->range(0, 1)
      ->orderBy('timestamp', 'DESC');

    // There is only one result entity.
    return $query->execute()->fetchObject();
  }

  /**
   * {@inheritdoc}
   */
  public function getNormalizedEntity($from_timestamp, $frequency, $rate_type) {
    // Check if the required normalized entity exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity')
      ->propertyCondition('frequency', $frequency)
      ->propertyCondition('meter_nid', $this->getMeterNode()->nid)
      ->propertyCondition('timestamp', $from_timestamp)
      ->propertyCondition('rate_type', $rate_type)
      ->range(0, 1)
      ->execute();
    if (!empty($result['electricity'])) {
      // Entity was found, return it.
      $id = key($result['electricity']);
      return entity_load_single('electricity', $id);
    }

    // Entity doesn't exist yet, create a new one.
    $values = array(
      'frequency' => $frequency,
      'meter_nid' => $this->getMeterNode()->nid,
      'timestamp' => $from_timestamp,
      'rate_type' => $rate_type,
    );

    $entity = entity_create('electricity', $values);
    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function getQueryForRawValues($table_name = 'negawatt_electricity') {
    $query = db_select($table_name, 'ne')
      ->condition('timestamp', $this->getTimestampFrom(), '>=')
      ->condition('timestamp', $this->getTimestampTo(), '<')
      ->condition('frequency', $this->getFrequency())
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->orderBy('timestamp');
    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function getDataFromRawTable() {
    $query = self::getQueryForRawValues();
    $query->fields('ne', array('timestamp', 'rate_type', 'kwh', 'power_factor'));
    return $query->execute();
  }

  /**
   * {@inheritdoc}
   */
  public function countEntitiesInNormalizedTable() {
    return self::getQueryForRawValues('negawatt_electricity_normalized')
      ->countQuery()
      ->execute()
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function getDataFromNormalizedTable() {
    $query = self::getQueryForRawValues('negawatt_electricity_normalized');
    $query->fields('ne', array('rate_type'));
    $query->addExpression('SUM(sum_kwh)', 'sum_kwh');
    $query->addExpression('AVG(avg_power)', 'avg_power');
    $query->addExpression('MIN(min_power_factor)', 'min_power_factor');
    $query->groupBy('rate_type');

    return $query->execute();
  }

  /**
   * {@inheritdoc}
   */
  public function saveNormalizedEntity($timestamp, $frequency, $rate_type, $power_factor, $avg_power, $sum_kwh) {
    // Prepare entity of normalized values.
    $normalized_entity = self::getNormalizedEntity($timestamp, $frequency, $rate_type);
    $wrapper = entity_metadata_wrapper('electricity', $normalized_entity);

    // Set entity's values.
    $wrapper->min_power_factor->set($power_factor);
    $wrapper->avg_power->set($avg_power);
    $wrapper->sum_kwh->set($sum_kwh);

    $wrapper->save();

    return $wrapper->value();
  }

  /**
   * {@inheritdoc}
   */
  public function fetchEntities($entities = NULL) {
    // First look for the entities in $entities.
    if ($entities && array_key_exists($this->getFrequency(), $entities)) {
      $entities_of_frequency = $entities[$this->getFrequency()];

      if (array_key_exists($this->getTimestampFrom(), $entities_of_frequency)) {
        // Timestamps' entity exists in entities array.
        // Return the found entities.
        return $entities_of_frequency[$this->getTimestampFrom()];
      }
    }

    // Either $entities is NULL or the required entities were not found.
    // Look for required entity in normalized electricity table
    $result = db_select('negawatt_electricity', 'ne')
      ->condition('timestamp', $this->getTimestampFrom())
      ->condition('meter_nid', $this->getMeterNode()->nid)
      ->condition('frequency', $this->getFrequency())
      ->fields('ne')
      ->execute();

    return $result;
  }

}
