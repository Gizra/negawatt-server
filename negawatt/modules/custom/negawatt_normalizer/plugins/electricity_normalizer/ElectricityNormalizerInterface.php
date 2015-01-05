<?php


/**
 * @file
 * Contains ElectricityNormalizerInterface.
 */

interface ElectricityNormalizerInterface {

  /**
   * frequency constant.
   */
  const MINUTE = 5;

  /**
   * frequency constant.
   */
  const HOUR = 4;

  /**
   * frequency constant.
   */
  const DAY = 3;

  /**
   * frequency constant.
   */
  const MONTH = 2;

  /**
   * frequency constant.
   */
  const YEAR = 1;

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
   * @param array $frequencies
   *    The required frequencies for normalization, e.g. HOUR. If empty, loop over all allowed frequencies.
   * @param array $time_period
   *    The time period to normalize. An array of two timestamps - beginning of time period, and end.
   *    Default: begin at the last_processed time of the meter node and end at current time.
   *
   * @return array
   *    The processed entities, or empty array if there were no values to process.
   */
  public function process($node, $frequencies = array(), $time_period = array());


  }
