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
   * @param array $time_period
   *    The time period to normalize. An array of two timestamps - beginning of time period, and end.
   *    Default: begin at the last_processed time of the meter node and end at current time.
   *
   * @return array
   *    The processed entities in the form array[frequency][timestamp][rate-type] = entity,
   *    or an empty array if there were no values to process.
   */
  public function process($frequencies = array(), $time_period = array());


  }
