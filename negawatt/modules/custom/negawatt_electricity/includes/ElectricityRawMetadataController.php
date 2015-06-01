<?php

/**
 * @file
 * Contains ElectricityRawMetadataController
 */

class ElectricityRawMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the raw electricity from meter has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'meter_type',
      'rate_type',
      'frequency',
      'meter_nid',
      'kwh',
      'power_factor',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    return $info;
  }

}
