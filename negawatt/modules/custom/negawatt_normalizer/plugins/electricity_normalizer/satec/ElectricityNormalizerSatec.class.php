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
}
