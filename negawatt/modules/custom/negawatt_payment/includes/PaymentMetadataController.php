<?php

/**
 * @file
 * Contains PaymentMetadataController.
 */

class PaymentMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the message has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'frequency',
      'payment_type',
      'meter_nid',
      'sum_amount',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['sum_amount']['type'] = 'decimal';
    $properties['meter_nid']['type'] = 'node';

    return $info;
  }

}
