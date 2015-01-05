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
   * @throws Exception for frequency higher than meter's max frequency.

   * @return StdClass
   *  The normalized entity.
   */
  protected function getNormalizedValues() {
    $wrapper = entity_metadata_wrapper('node', $this->getMeterNode());
    // The requested frequency can't be higher (shorter) than the meter's max frequency.
    if ($this->strToFrequency($wrapper->field_max_frequency->value()) < $this->getFrequency()) {
      $params = array(
        '@frequency' => $this->frequencyToStr($this->getFrequency()),
      );
      throw new \Exception(format_string('IEC normalizer cannot handle that frequency: @frequency', $params));
    }

    if ($this->getFrequency() != $this->strToFrequency($wrapper->field_max_frequency->value())) {
      // The frequency requested is not the maximal frequency for this meter.
      // Use ElectricityNormalizerBase::calcNormalizedValues() to calculate
      // normalized values.
      return $this->calcNormalizedValues();
    }

    // If we're here, the requested frequency is the maximal for the current
    // meter. Get the data from raw table.
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

  /**
   * {@inheritdoc}
   */
  public function access() {
    $node = $this->getMeterNode();
    return $node->type == 'iec_meter';
  }

}
