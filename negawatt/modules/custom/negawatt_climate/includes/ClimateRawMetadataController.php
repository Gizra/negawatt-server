<?php

/**
 * @file
 * Contains ClimateRawMetadataController
 */

class ClimateRawMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the raw electricity from meter has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'frequency',
      'meter_nid',
      'temperature',
      'humidity',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['temperature']['type'] = 'decimal';
    $properties['humidity']['type'] = 'decimal';
    $properties['meter_nid']['type'] = 'node';

    return $info;
  }

}
