<?php

/**
 * @file
 * Contains ElectricityNormalizerSatec.
 */

class ElectricityNormalizerSatec extends \ElectricityNormalizerBase {

  /**
   * {@inheritdoc}
   */
  public function access() {
    $node = $this->getMeterNode();
    return $node->type == 'satec_meter';
  }

  /**
   * {@inheritdoc}
   */
  public function processRawEntity($record, $prev_record) {
    $processed_record = clone $record;
    if (!$prev_record) {
      // No previous record, can't figure out kWhs...
      $processed_record->kwh = 0;
    }
    else {
      // Perv-record exists, calc kWhs delta.
      $processed_record->kwh -= $prev_record->kwh;
    }
    return $processed_record;
  }

}
