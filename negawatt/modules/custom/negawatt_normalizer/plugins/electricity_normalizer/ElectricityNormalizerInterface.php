<?php


/**
 * @file
 * Contains ElectricityNormalizerInterface.
 */

interface ElectricityNormalizerInterface {

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
   * Constructor for the ElectricityNormalizer handler.
   *
   * @param array $plugin
   *   The plugin definition array.
   */
  public function __construct(array $plugin);

  /**
   * Determine if the passed meter entities are valid.
   *
   * @return bool
   *   TRUE if the current request has access to the requested resource.
   *   FALSE otherwise.
   */
  public function access();

  /**
   * Entry point to process a request.
   *
   * It's the callers responsibility to call setMeterNode() before calling process().
   *
   * @param array $frequencies
   *    The required frequencies for normalization, e.g. HOUR. If empty, loop over all allowed frequencies.
   * @param null|int $from_timestamp
   *    Beginning of time period. If NULL, will be set to the last_processed time of the meter node
   * @param null|int $to_timestamp
   *    End of time period. If NULL, will be set to now.
   * @return array
   *    The processed entities in the form array[frequency][timestamp][rate-type] = entity,
   *    or an empty array if there were no values to process.
   */
  public function process($frequencies = array(), $from_timestamp = NULL, $to_timestamp = NULL);

  /**
   * Allow modifying the raw-electricity entity record.
   *
   * Called during processRawEntities() to allow the sub-classed meter-normalizer
   * to modify the entity record. e.g. calc the kwh as difference from prev record.
   *
   * @param StdClass &$record
   *    The current record.
   * @param StdClass|null $prev_record
   *    The previous record (or NULL), for delta calculation
   *
   * @return StcClass
   *    The modified record.
   */
  public function processRawEntity($record, $prev_record);
}
