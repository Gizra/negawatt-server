<?php


/**
 * @file
 * Contains NegaWattNormalizerDataProviderInterface.
 */

interface NegaWattNormalizerDataProviderInterface {

  /**
   * Constructor for the NegaWattNormalizerDataProviderInterface.
   *
   * @param int $from_timestamp
   *    Beginning timestamp value.
   * @param int $to_timestamp
   *    End timestamp value.
   * @param int $frequency
   *    Frequency.
   * @param $node
   *    The reference meter node.
   */
  public function __construct($from_timestamp, $to_timestamp, $frequency, $node);

  /**
   * Return the number raw-electricity entity for the current meter node.
   *
   * @param $node
   *    The reference meter node.
   * @param $frequency
   *    The target frequency.
   *
   * @return int The number of raw-electricity entity for the meter.
   */
  public static function getNumberOfRawElectricityEntities($node, $frequency);

  /**
   * Return the number normalized-electricity entity for the current meter node.
   *
   * @param $node
   *    The reference meter node.
   * @param $frequency
   *    The target frequency.
   *
   * @return int The number of normalized-electricity entity for the meter.
   */
  public static function getNumberOfNormalizedElectricityEntities($node, $frequency);

  /**
   * Return the timestamp of the oldest raw-electricity entity for the
   * current meter node.
   *
   * If no entity exists, return 0.
   *
   * @param $node
   *    The reference meter node.
   * @param $frequency
   *    The target frequency.
   *
   * @return int The timestamp of oldest raw-electricity entity for the meter.
   * The timestamp of oldest raw-electricity entity for the meter.
   */
  public static function getOldestRawElectricityEntity($node, $frequency);

  /**
   * Return the timestamp of the oldest raw-electricity entity for the
   * current meter node.
   *
   * If no entity exists, return 0.
   *
   * @param $node
   *    The reference meter node.
   * @param $frequency
   *    The target frequency.
   *
   * @return int The timestamp of oldest raw-electricity entity for the meter.
   * The timestamp of oldest raw-electricity entity for the meter.
   */
  public static function getOldestNormalizedElectricityEntity($node, $frequency);

  /**
     * Return the timestamp of the most recent raw-electricity entity for the
     * current meter node.
     *
     * If no entity exists, return 0.
     *
     * @param $node
     *    The reference meter node.
     * @param $frequency
     *    The target frequency.
     *
     * @return int The timestamp of oldest raw-electricity entity for the meter.
     * The timestamp of most recent raw-electricity entity for the meter.
     */
    public static function getLatestNormalizedElectricityEntity($node, $frequency);

    /**
   * The raw entity before a given time.
   *
   * The function returns the raw-electricity entity for the current meter node,
   * that is immediately before a given timestamp.
   *
   * @return StdClass|null
   *    The entity object, or NULL.
   */
  public function getRawEntityBefore();

  /**
   * Get or create the normalized entity for a time period, rate-type, frequency, and meter.
   *
   * @param int $from_timestamp
   *    Time of beginning of time-frame for the entity.
   * @param $frequency
   *    Entity's frequency.
   * @param string $rate_type
   *    Rate type of entity.
   *
   * @return StdClass
   *    The entity found (or created).
   */
  public function getNormalizedEntity($from_timestamp, $frequency, $rate_type);

  /**
   * Prepare a standard query for the raw table.
   *
   * @param string $table_name
   *    The name of the table to be queried. Defaults to 'negawatt_electricity'.
   *
   * @return SelectQuery
   *    The Query object.
   */
  public function getQueryForRawValues($table_name = 'negawatt_electricity');

  /**
   * Creates and executes a query to fetch entities from raw-electricity table.
   *
   * @return mixed
   *    Query result.
   */
  public function getDataFromRawTable();

  /**
   * Count the relevant entities in normalized-electricity table.
   *
   * @return int
   *    Count of entities.
   */
  public function countEntitiesInNormalizedTable();

  /**
   * Creates and executes a query to fetch entities from normalized-electricity table.
   *
   * @return mixed
   *    Query result.
   */
  public function getDataFromNormalizedTable();

  /**
   * Create or re-use normalized entity, then fill it with new values and save.
   *
   * @param int $timestamp
   *    Entity's timestamp.
   * @param $frequency
   *    Entity's frequency.
   * @param string $rate_type
   *    Entity's rate-type.
   * @param float $power_factor
   *    New value to save.
   * @param float $avg_power
   *    New value to save.
   * @param int $sum_kwh
   *    New value to save.
   *
   * @return StdClass
   *    The saved entity.
   */
  public function saveNormalizedEntity($timestamp, $frequency, $rate_type, $power_factor, $avg_power, $sum_kwh);

  /**
   * Fetch entities answering node, timestamp-from, and frequency requirements.
   *
   * If $entities are given, look first there.
   * If $entities are not given, or they were given but the entities were on found
   * within them, then look in normalized-electricity table.
   *
   * @param null $entities
   *    An array of entities of the form array[frequency][timestamp][rate-type] = entity.
   *
   * @return array
   *    An array of entities.
   */
  public function fetchEntities($entities = NULL);
}
