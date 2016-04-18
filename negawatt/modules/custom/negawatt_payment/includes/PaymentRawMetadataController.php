<?php

/**
 * @file
 * Contains PaymentRawMetadataController
 */

class PaymentRawMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the raw payment from meter has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'payment_type',
      'frequency',
      'meter_nid',
      'amount',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    return $info;
  }

}
