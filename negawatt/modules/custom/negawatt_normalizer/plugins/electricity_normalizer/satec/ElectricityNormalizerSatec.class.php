<?php

/**
 * @file
 * Contains ElectricityNormalizerSatec.
 */

class ElectricityNormalizerSatec extends \ElectricityNormalizerBase {

  /**
   * Normalize the required entities.
   * Must be supplied by child object.
   *
   * @throws Exception for frequency different than HOUR (NIY).

   * @return StdClass
   *  The normalized entity.
   */
  protected function normalizeValues() {
    if ($this->getFrequency() == \ElectricityNormalizerInterface::HOUR) {

      // For Satec, the minimal freq. is hour, get data from raw table.
      $query = db_select('negawatt_electricity', 'ne')
        ->condition('timestamp', array($this->getTimestampBeginning(), $this->getTimestampEnd()), 'BETWEEN')
        ->condition('meter_nid', $this->getMeterNode()->nid);

      $query->addExpression('MIN(cumulative_kwh)', 'minCumPower');
      $query->addExpression('MAX(cumulative_kwh)', 'maxCumPower');
      $query->addExpression('MIN(timestamp)', 'minTimestamp');
      $query->addExpression('MAX(timestamp)', 'maxTimestamp');
      $query->addExpression('MIN(power_factor)', 'minPowerFactor');
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
      if ($result->minTimestamp >= $result->maxTimestamp) {
        // @todo: What if only one record exists in the raw table for that time period?
        // Max and min timestamps are the same, cannot calculate avgPower.
        return NULL;
      }


      // Calculate average power at time period.
      $energyDiff = $result->maxCumPower - $result->minCumPower;
      $timeDiff = ($result->maxTimestamp - $result->minTimestamp);
      // Convert from seconds to hours (energy is given by kilowatt-hours).
      $timeDiff = $timeDiff/60./60;
      // Average power (in kilowatts) is given by dividing the total energy at
      // the time period (in kilowatt-hours) by the period's length (in hours).
      $avgPower = $energyDiff / $timeDiff;

      return array(
        'min_power_factor' => $result->minPowerFactor,
        'avg_power' => $avgPower,
      );
    }

    // @todo: for frequency higher then hour, use data from normalized table
    throw new \Exception('Unhandled frequency @ElectricityNormalizerSatec::normalizeValues().');
  }
}
