<?php

/**
 * @file
 * Contains ElectricityNormalizerModbus.
 */

class ElectricityNormalizerModbus extends \ElectricityNormalizerBase {

  /**
   * {@inheritdoc}
   */
  public function access() {
    $node = $this->getMeterNode();
    return $node->type == 'modbus_meter';
  }

  /**
   * {@inheritdoc}
   */
  public function processRawEntity($record, $prev_record) {
    parent::processRawEntity($record, $prev_record);

    $processed_record = clone $record;
    if (!$prev_record) {
      // No previous record, can't figure out kWhs...
      $processed_record->kwh = 0;
      return $processed_record;
    }

    // Catch bad records
    if ($processed_record->kwh == 0) {
      // kwh == NULL means a bad reading.
      $processed_record->kwh = NULL;
      return $processed_record;
    }

    // Perv-record exists, calc kWhs delta.
    $processed_record->kwh -= $prev_record->kwh;

    return $processed_record;
  }
}
