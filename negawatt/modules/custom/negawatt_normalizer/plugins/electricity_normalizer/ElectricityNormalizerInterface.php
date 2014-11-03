<?php


/**
 * @file
 * Contains ElectricityNormalizerInterface.
 */

interface ElectricityNormalizerInterface {

  /**
   * frequency constant.
   */
  const HOUR = 'hour';

  /**
   * frequency constant.
   */
  const DAY = 'day';

  /**
   * frequency constant.
   */
  const WEEK = 'week';

  /**
   * frequency constant.
   */
  const MONTH = 'month';

  /**
   * frequency constant.
   */
  const YEAR = 'year';

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
   * @param stdClass $node
   *    The node of type iec_meter.
   * @param int $timestamp_end
   *    The end timestamp of period to normalize. Default to NULL, which
   *    indicates "now".
   * @param array $frequencies
   *    The required frequencies for normalization, e.g. HOUR. If empty, loop over all allowed frequencies.
   * @param array $rate_types
   *    The rate-types to use (peak, mid, etc.). If empty, loop over all 4 of them.
   *
   * @return array
   *    The processed entities, or empty array if there were no values to process.
   */
  public function process($node, $timestamp_end = NULL, $frequencies = array(), $rate_types = array());


  }
