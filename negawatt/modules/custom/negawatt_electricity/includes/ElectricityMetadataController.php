<?php

/**
 * @file
 * Contains ElectricityMetadataController.
 */

class ElectricityMetadataController extends EntityDefaultMetadataController {

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
      'rate_type',
      'meter_nid',
      'avg_power',
      'sum_kwh',
      'min_power_factor',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['avg_power']['type'] = 'decimal';
    $properties['sum_kwh']['type'] = 'decimal';
    $properties['min_power_factor']['type'] = 'decimal';
    $properties['meter_nid']['type'] = 'node';

    return $info;
  }

}
