<?php


/**
 * @file
 * Contains NegaWattNormalizerDataProviderBase.
 */

class NegaWattNormalizerDataProviderManagerBase implements \NegaWattNormalizerDataProviderManagerInterface {

  /**
   * Constructor for the NegaWattNormalizerDataProviderManagerInterface.
   */
  public function __construct() {
  }

  /**
   * {@inheritdoc}
   */
  public function createDataProvider($from_timestamp, $to_timestamp, $frequency, $node) {
    return new \NegaWattNormalizerDataProviderBase($from_timestamp, $to_timestamp, $frequency, $node);
  }
}
