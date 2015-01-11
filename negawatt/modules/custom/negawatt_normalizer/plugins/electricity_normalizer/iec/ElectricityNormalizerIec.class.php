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

}
