<?php


/**
 * @file
 * Contains NegaWattNormalizerAnalyzerCompareLastYear.
 */

class NegaWattNormalizerAnalyzerCompareLastYear implements \NegaWattNormalizerAnalyzerInterface {

  protected $dataProviderManager;

  /**
   * @return NegaWattNormalizerDataProviderManagerInterface
   *    The data provider manager.
   */
  public function getDataProviderManager() {
    return $this->dataProviderManager;
  }

  /**
   * Constructor for the NegaWattNormalizerAnalyzerCompareLastYear.
   *
   * @param NegaWattNormalizerDataProviderManagerInterface $data_provider_manager
   *    A data-provider-manager to use.
   */
  public function __construct(\NegaWattNormalizerDataProviderManagerInterface $data_provider_manager = NULL) {
    $this->dataProviderManager = $data_provider_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'year_back';
  }

  /**
   * {@inheritdoc}
   */
  public function applies($data) {
    // Currently accepts only data sets with monthly data.
    return !empty($data[\NegaWattNormalizerTimeManagerInterface::MONTH]);
  }

  /**
   * {@inheritdoc}
   */
  public function process(array $data, $create_message = TRUE) {
    $meter_nid = 0;
    $return = array();
    $entities_of_frequency = $data[\NegaWattNormalizerTimeManagerInterface::MONTH];
    foreach ($entities_of_frequency as $timestamp => $entities_of_timeframe) {
      // Calc sum of kwh for the time-frame (i.e., sum over rate-types).
      $sum_kwh = 0;
      foreach ($entities_of_timeframe as $entity) {
        $sum_kwh += $entity->sum_kwh;
        $meter_nid = $entity->meter_nid;
      }

      // Look for an entity from a year ago
      $year_ago = strtotime('-1 year', $timestamp);
      $data_provider = $this->getDataProviderManager()->createDataProvider($year_ago, $year_ago, \NegaWattNormalizerTimeManagerInterface::MONTH, $meter_nid);
      // The data-provider will look first in data, if none were found, it'll look
      // in the normalized-electricity db.
      $prev_year_entities = $data_provider->fetchEntities($data);

      $prev_year_sum_kwh = 0;
      foreach ($prev_year_entities as $entity) {
        $prev_year_sum_kwh += $entity->sum_kwh;
      }

      // If prev year's record was found, check that it does not differ by more than 10%
      if ($prev_year_sum_kwh) {
        $kwh_diff = ($sum_kwh / $prev_year_sum_kwh);
        if ($kwh_diff < 0.90 || $kwh_diff > 1.10) {
          // Consumed kWh difference is suspicious, put an alert
          // Prepare message parameters.
          $node_wrapper = entity_metadata_wrapper('node', $meter_nid);
          $return[] = array(
            'nid' => $meter_nid,
            'message_type' => 'anomalous_consumption',
            'description' => $node_wrapper->field_place_description->value(),
            'arguments' => array(
              // @fixme: date format of 'Y-m' fits monthly data. Change according to frequency.
              '@date' => date('Y-m', $timestamp),
              '@frequency' => 'month',
              '@cur_kwh' => $sum_kwh,
              '@prev_kwh' => $prev_year_sum_kwh,
            ),
          );
        }
      }
    }
    return $return;
  }
}
