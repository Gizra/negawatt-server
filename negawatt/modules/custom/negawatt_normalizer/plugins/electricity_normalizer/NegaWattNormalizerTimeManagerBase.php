<?php


/**
 * @file
 * Contains NegaWattNormalizerTimeManagerBase.
 */

class NegaWattNormalizerTimeManagerBase implements \NegaWattNormalizerTimeManagerInterface {

  /**
   * Constructor for the NegaWattNormalizerTimeManagerInterface.
   */
  public function __construct() {

  }

  /**
   * {@inheritdoc}
   */
  public static function getTimeFrameBoundary($frequency, $timestamp) {
    // Create DateTime object to calculate the beginning of time period.
    $date_time = new \DateTime();
    $date_info = getdate($timestamp);
    switch ($frequency) {
      case \NegaWattNormalizerTimeManagerInterface::MINUTE: {
        // Take the beginning of the previous minute.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday']);
        $hour = $date_info['hours'];
        // If timestampEnd was set to exact minute, go back one minute, otherwise go back to beginning of minute.
        $minute = (0 == $date_info['seconds']) ? ($date_info['minutes'] - 1) : $date_info['minutes'];
        $date_time->setTime($hour, $minute, 0);
        break;
      }
      case \NegaWattNormalizerTimeManagerInterface::HOUR: {
        // Take the beginning of the previous hour.
        $date_time->setDate($date_info['year'], $date_info['mon'], $date_info['mday']);
        // If timestampEnd was set to exact hour, go back one hour, otherwise go back to beginning of hour.
        $hour = (0 == $date_info['minutes'] && 0 == $date_info['seconds']) ? ($date_info['hours'] - 1) : $date_info['hours'];
        $date_time->setTime($hour, 0, 0);
        break;
      }
      case \NegaWattNormalizerTimeManagerInterface::DAY: {
        // Take the beginning of the previous day.
        // If timestampEnd was set to beginning of the day, go back one day, otherwise go back to beginning of the day.
        $day = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds']) ? ($date_info['mday'] - 1) : $date_info['mday'];
        $date_time->setDate($date_info['year'], $date_info['mon'], $day);
        $date_time->setTime(0, 0, 0);
        break;
      }
      case \NegaWattNormalizerTimeManagerInterface::MONTH: {
        // Take the beginning of the 1st day of the previous month.
        // If timestampEnd was set to beginning of the month, go back one month, otherwise go back to beginning of the month.
        $month = (0 == $date_info['hours'] && 0 == $date_info['minutes'] && 0 == $date_info['seconds'] && 1 == $date_info['mday']) ?
          ($date_info['mon'] - 1) : $date_info['mon'];
        $date_time->setDate($date_info['year'], $month, 1);
        $date_time->setTime(0, 0, 0);
        if ($date_time->getTimestamp() == $timestamp) {
          // If daylight saving time was changed at the 1st fo the month, getdate()
          // will return hour 01:00 for hour 00:00, so setDate and setTime will
          // return us to the same timestamp as we began. In order to overcome
          // the problem, decrease the month and call setDate and setTime again.
          $month--;
          $date_time->setDate($date_info['year'], $month, 1);
          $date_time->setTime(0, 0, 0);
        }
        break;
      }
      case \NegaWattNormalizerTimeManagerInterface::YEAR: {
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
        throw new \Exception(format_string('Cannot figure out frequency "@frequency".', array('@frequency' => \NegaWattNormalizerTimeManagerBase::frequencyToStr($frequency))));
      }
    }
    return $date_time->getTimestamp();
  }

  /**
   * {@inheritdoc}
   */
  public static function getNextTimeSlice($frequency, $from_timestamp, $to_timestamp) {
    switch ($frequency) {
      case \NegaWattNormalizerTimeManagerInterface::MINUTE: {
        // 'hard' retrace to minute boundary to avoid problems with daylight saving time change.
        // Retrace the number of seconds until previous minute boundary.
        $timestamp = $to_timestamp - 1;
        return $timestamp - ($timestamp % 60);
      }
      case \NegaWattNormalizerTimeManagerInterface::HOUR: {
        // 'hard' retrace to hour (3600 seconds) boundary (see comment above).
        $timestamp = $to_timestamp - 1;
        return $timestamp - ($timestamp % 3600);
      }
      default:
        // use DateTime::setTime() and setDate() since day interval and higher
        // will not be affected by daylight saving time change.
        return $from_timestamp;
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getAllowedFrequencies($max_frequency) {
    // Look for maximum frequency allowed for current meter
    $return = array();
    // Prepare an array with allowed frequencies. Use fallthrough.
    switch ($max_frequency) {
      case \NegaWattNormalizerTimeManagerInterface::MINUTE:
        array_push($return, \NegaWattNormalizerTimeManagerInterface::MINUTE);
      case \NegaWattNormalizerTimeManagerInterface::HOUR:
        array_push($return, \NegaWattNormalizerTimeManagerInterface::HOUR);
      case \NegaWattNormalizerTimeManagerInterface::DAY:
        array_push($return, \NegaWattNormalizerTimeManagerInterface::DAY);
      case \NegaWattNormalizerTimeManagerInterface::MONTH:
        array_push($return, \NegaWattNormalizerTimeManagerInterface::MONTH);
      case \NegaWattNormalizerTimeManagerInterface::YEAR:
        array_push($return, \NegaWattNormalizerTimeManagerInterface::YEAR);
    }
    return $return;
  }

  /**
   * Prepare time period beginning and end.
   *
   * @param null|int $from_timestamp
   *    Beginning of time-period.
   * @param null|int  $to_timestamp
   *    End of time-period.
   * @param int $last_processed
   *    Last processed value for the meter - will be used for time-period
   *    beginning if $from_timestamp is NULL.
   *
   * @return array [$from_timestamp, $to_timestamp].
   *    [$from_timestamp, $to_timestamp].
   *
   * @throws Exception if end-timestamp is befor the beginning.
   */
  public static function getTimePeriod($from_timestamp = NULL, $to_timestamp = NULL, $last_processed) {
    if (!$from_timestamp) {
      // Beginning of time period default to last processed.
      $from_timestamp = $last_processed;
    }
    if (!$to_timestamp) {
      // End of time period default to now.
      $to_timestamp = time();
    }

    // Sanity check on time period.
    if ($to_timestamp < $from_timestamp) {
      // Don't allow to_timestamp to remain lower than from_timestamp.
      $to_timestamp = $from_timestamp;
    }

    return array($from_timestamp, $to_timestamp);
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
  public static function strToFrequency($str) {
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
        return \NegaWattNormalizerTimeManagerInterface::YEAR;
      case 'month':
        return \NegaWattNormalizerTimeManagerInterface::MONTH;
      case 'day':
        return \NegaWattNormalizerTimeManagerInterface::DAY;
      case 'hour':
        return \NegaWattNormalizerTimeManagerInterface::HOUR;
      case 'minute':
        return \NegaWattNormalizerTimeManagerInterface::MINUTE;
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
  public static function frequencyToStr($frequency) {
    // Handle an array of frequencies.
    if (is_array($frequency)) {
      $return = array();
      foreach ($frequency as $f) {
        array_push($return, \NegaWattNormalizerTimeManagerBase::frequencyToStr($f));
      }
      return $return;
    }
    // Handle a single frequency.
    switch ($frequency) {
      case \NegaWattNormalizerTimeManagerInterface::YEAR:
        return 'year';
      case \NegaWattNormalizerTimeManagerInterface::MONTH:
        return 'month';
      case \NegaWattNormalizerTimeManagerInterface::DAY:
        return 'day';
      case \NegaWattNormalizerTimeManagerInterface::HOUR:
        return 'hour';
      case \NegaWattNormalizerTimeManagerInterface::MINUTE:
        return 'minute';
      default:
        throw new \Exception(format_string('Frequency "@freq" not known.', array('@freq' => $frequency)));
    }
  }
}
