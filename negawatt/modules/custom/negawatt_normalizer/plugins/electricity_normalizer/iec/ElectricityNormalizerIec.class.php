<?php

/**
 * @file
 * Contains ElectricityNormalizerIec.
 */

class ElectricityNormalizerIec extends \ElectricityNormalizerBase {

  /**
   * {@inheritdoc}
   */
  public function access() {
    $node = $this->getMeterNode();
    return $node->type == 'iec_meter';
  }

  /**
   * {@inheritdoc}
   */
  public function processRawEntity($record, $prev_record) {
    // Nothing to do.
    return $record;
  }
}
