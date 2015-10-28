<?php


/**
 * @file
 * Contains NegaWattNormalizerDataProviderInterface.
 */

interface NegaWattNormalizerDataProviderManagerInterface {

  /**
   * Constructor for the NegaWattNormalizerDataProviderInterface.
   */
  public function __construct();

  /**
   * Create a new data-provider.
   *
   * @param int $from_timestamp
   *    Beginning timestamp value for new data provider.
   * @param int $to_timestamp
   *    End timestamp value for new data provider.
   * @param int $frequency
   *    Frequency for new data provider.
   * @param $node
   *    The reference meter node.
   *
   * @return NegaWattNormalizerDataProviderInterface
   *    A new data-provider object.
   */
  public function createDataProvider($from_timestamp, $to_timestamp, $frequency, $node);

}
