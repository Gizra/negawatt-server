<?php


/**
 * @file
 * Contains NegaWattNormalizerTimeManagerInterface.
 */

interface NegaWattNormalizerTimeManagerInterface {

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
   * Constructor for the NegaWattNormalizerTimeManagerInterface.
   */
  public function __construct();

  /**
   * Get the timestamp of the beginning of time period to normalize.
   *
   * If not set yet, will calculate the timestamp from the timestampEnd and frequency.
   *
   * @param int $frequency
   *    Frequency to use for calculating time frame boundaries.
   * @param int $timestamp
   *    Reference timestamp to calculate time-frame boundary.
   *
   * @return int
   *    Timestamp of time-frame boundary.
   *
   * @throws Exception
   *    On unknown frequency.
   */
  public static function getTimeFrameBoundary($frequency, $timestamp);

  /**
   * Generate the end-timestamp for the next time slice in processNormalizedEntities()
   *
   * Time slices go backwards, from end timestamp to the beginnings.
   * For year, month, and day frequencies, use $this->getTimestampBeginning.
   * For minute and hour, subtract the number of seconds from $this->timestampEnd.
   * This is because when switching from winter to summer clock, using
   * $date_time->setTime, as in getTimestampBeginning, will repeat the same hour again!
   *
   * @param int $frequency
   *    The frequency.
   * @param int $from_timestamp
   *    Beginning of current time slice
   * @param int $to_timestamp
   *    End of current time slice
   *
   * @return int
   *    The end-timestamp for next time slice.
   */
  public static function getNextTimeSlice($frequency, $from_timestamp, $to_timestamp);

  /**
   * The set of allowed frequencies for that meter type.
   *
   * for ElectricityNormalizerIec object - use MONTH and up.
   *
   * @param int $max_frequency
   *    The max allowed frequency for the meter node.
   *
   * @return array
   *    Array of allowed frequencies for that meter type.
   */
  public static function getAllowedFrequencies($max_frequency);

}
