<?php

/**
 * @file
 * Contains ElectricityNormalizerSatec.
 */

class ElectricityNormalizerSatec extends \ElectricityNormalizerBase {

  /**
   * Normalize the required entities.
   * 
   * Must be supplied by child object.
   *
   * @throws Exception for frequency different than HOUR (NIY).

   * @return StdClass
   *    The normalized entity.
   */
  protected function getNormalizedValues() {
    if ($this->getFrequency() == \ElectricityNormalizerInterface::HOUR) {

      // For Satec, the minimal freq. is hour, get data from raw table.
      $query = parent::getQueryForNormalizedValues();

      $query->addExpression('MIN(cumulative_kwh)', 'min_cum_power');
      $query->addExpression('MAX(cumulative_kwh)', 'max_cum_power');
      $query->addExpression('MIN(timestamp)', 'min_timestamp');
      $query->addExpression('MAX(timestamp)', 'max_timestamp');
      $query->addExpression('MIN(power_factor)', 'min_power_factor');
      // @fixme: group by rate_type

      $result = $query->execute();

      $row_count = $result->rowCount();

      if (!$row_count) {
        // Nothing found at that time interval.
        // @fixme: Shouldn't we return array('minPowerFactor'=>0, 'avg_power'=>0)?
        return;
      }

      if ($row_count >1) {
        // @fixme: Several records might return for different rate_types.
        throw new \Exception('Cannot handle TOUse rates yet.');
      }

      // Only one record is expected.
      $result = $result->fetchObject();

      // Calculate avg_power and return result.
      
      // If minTimestamp = maxTimestamp, divide-by-zero will result.
      if ($result->min_timestamp >= $result->max_timestamp) {
        // @todo: What if only one record exists in the raw table for that time period?
        // Max and min timestamps are the same, cannot calculate avgPower.
        return NULL;
      }

      // Calculate average power at time period.
      $energy_diff = $result->max_cum_power - $result->min_cum_power;
      $time_diff = ($result->max_timestamp - $result->min_timestamp);
      // Convert from seconds to hours (energy is given by kilowatt-hours).
      $time_diff = $time_diff/60./60;
      // Average power (in kilowatts) is given by dividing the total energy at
      // the time period (in kilowatt-hours) by the period's length (in hours).
      $avg_power = $energy_diff / $time_diff;

      return array(
        'min_power_factor' => $result->min_power_factor,
        'avg_power' => $avg_power,
      );
    }

    // @todo: for frequency higher then hour, use data from normalized table
    throw new \Exception('Unhandled frequency @ElectricityNormalizerSatec::getNormalizedValues().');
  }
}
