<?php

/**
 * @file
 * Contains ElectricityNormalizerIec.
 */

class ElectricityNormalizerIec extends \ElectricityNormalizerBase {

  /**
   * Normalize the required entities.
   *
   * Must be supplied by child object.
   *
   * @throws Exception for frequency different than MONTH.

   * @return StdClass
   *  The normalized entity.
   */
  protected function getNormalizedValues() {
    if ($this->getFrequency() == \ElectricityNormalizerInterface::HOUR ||
      $this->getFrequency() == \ElectricityNormalizerInterface::DAY ||
      $this->getFrequency() == \ElectricityNormalizerInterface::WEEK) {
      $params = array(
        '@frequency' => $this->getFrequency(),
      );
      throw new \Exception(format_string('IEC normalizer cannot handle that frequency: @freauency', $params));
    }

    if ($this->getFrequency() == \ElectricityNormalizerInterface::MONTH) {

      // For IEC, the minimal frequency is month, get data from raw table.
      $query = parent::getQueryForNormalizedValues();

      $query->addExpression('MIN(kwh)', 'min_kwh');
      $query->addExpression('MAX(kwh)', 'max_kwh');
      $query->addExpression('SUM(kwh)', 'kwh');
      $query->addExpression('MIN(power_factor)', 'min_power_factor');

      $result = $query->execute();

      $row_count = $result->rowCount();

      if (!$row_count) {
        // Nothing found at that time interval.
        return;
      }

      if ($row_count > 1) {
        throw new \Exception('Row-count>1 @ElectricityNormalizerIec::getNormalizedValues.');
      }

      // Only one record is expected.
      $result = $result->fetchObject();

      // Test for null result.
      if (!$result->kwh) {
        return NULL;
      }

      // Calculate average power at time period.
      $energy_diff = $result->kwh;
      $time_diff = $this->getTimestampEnd() - $this->getTimestampBeginning();
      // Convert from seconds to hours (energy is given by kilowatt-hours).
      $time_diff = $time_diff/60./60;
      // Average power (in kilowatts) is given by dividing the total energy at
      // the time period (in kilowatt-hours) by the period's length (in hours).
      $avg_power = $energy_diff / $time_diff;

      return array(
        'min_power_factor' => $result->min_power_factor,
        'avg_power' => $avg_power,
        'sum_kwh' => $energy_diff,
      );
    }

    // @todo: for frequency higher then hour, use data from normalized table
    $params = array(
      '@freq' => $this->getFrequency(),
    );
    throw new \Exception(format_string('Unhandled frequency "@freq".', $params));
  }

  /**
   * The set of allowed frequencies for that meter type.
   *
   * for ElectricityNormalizerIec object - use MONTH and up.
   *
   * @return array
   *  Array of allowed frequencies for that meter type.
   */
  protected function getAllowedFrequencies() {
    return array(
      \ElectricityNormalizerBase::MONTH,
      //@todo: add YEAR
    );
  }

  /**
   * {@inheritdoc}
   */
  public function access() {
    $node = $this->getMeterNode();
    return $node->type == 'iec_meter';
  }

}
