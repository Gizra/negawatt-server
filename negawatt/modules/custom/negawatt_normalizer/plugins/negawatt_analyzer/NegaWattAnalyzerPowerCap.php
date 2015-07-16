<?php


/**
 * @file
 * Contains NegaWattNormalizerAnalyzerPowerCap.
 */

class NegaWattAnalyzerPowerCap implements \NegaWattAnalyzerInterface {

  protected $dataProviderManager;

  /**
   * @return NegaWattNormalizerDataProviderManagerInterface
   *    The data provider manager.
   */
  public function getDataProviderManager() {
    return $this->dataProviderManager;
  }

  /**
   * Constructor for the NegaWattNormalizerAnalyzerPowerCap.
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
    return 'power_cap';
  }

  /**
   * {@inheritdoc}
   */
  public function applies($data) {
    // Currently accepts only data sets with monthly data.
    return !empty($data[\NegaWattNormalizerTimeManagerInterface::MINUTE]);
  }

  /**
   * {@inheritdoc}
   */
  public function process(array $data, $create_message = TRUE) {
    $meter_nid = 0;
    $return = array();
    $entities_of_frequency = $data[\NegaWattNormalizerTimeManagerInterface::MINUTE];
    foreach ($entities_of_frequency as $timestamp => $entities_of_timeframe) {

      foreach ($entities_of_timeframe as $rate_type => $entity) {

        // weekday: Sun = 1 .. Sat = 7
        $weekday = date('w', $entity->timestamp) + 1;
        $hour = date('H', $entity->timestamp);
        if (empty($meter_nid)) {
          $meter_nid = $entity->meter_nid;
        }
        // Look for the relevant power-cap entity
        $query = new EntityFieldQuery();
        $result = $query->entityCondition('entity_type', 'power_cap_analyzer_info')
          ->propertyCondition('meter_nid', $meter_nid)
          ->propertyCondition('weekday', $weekday)
          ->propertyCondition('hour_from', $hour, '<=')
          ->propertyCondition('hour_to', $hour, '>')
          ->execute();

        // If power-cap record was found, check that vag-power is below cap.
        if (!empty($result['power_cap_analyzer_info'])) {
          $cap_entity_ids = array_keys($result['power_cap_analyzer_info']);
          $cap_entities = entity_load('power_cap_analyzer_info', $cap_entity_ids);
          $cap = $cap_entities[$cap_entity_ids[0]]->cap;
          // In case of multiple matches, take minimal cap value.
          foreach ($cap_entities as $cap_entity) {
            $cap = min($cap, $cap_entity->cap);
          }

          if ($entity->avg_power > $cap) {
            // Average power consumed is higher that the cap, put an alert
            // Prepare message parameters.
            $node_wrapper = entity_metadata_wrapper('node', $meter_nid);
            $return[] = array(
              'nid' => $meter_nid,
              'message_type' => 'demand_exceeds_cap',
              'meter_title' => $node_wrapper->label(),
              'description' => $node_wrapper->field_place_description->value(),
              'address' => $node_wrapper->field_place_address->value(),
              'arguments' => array(
                '@date' => date('Y-m-d H:i', $timestamp),
                '@frequency' => 'minute',
                '@avg_power' => $entity->avg_power,
                '@cap' => $cap,
              ),
            );
          }
        }
      }
    }
    return $return;
  }
}
