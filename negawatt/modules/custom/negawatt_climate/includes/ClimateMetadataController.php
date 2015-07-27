<?php

/**
 * @file
 * Contains ClimateMetadataController.
 */

class ClimateMetadataController extends EntityDefaultMetadataController {

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
      'meter_nid',
      'avg_temp',
      'min_temp',
      'max_temp',
      'deg_days',
      'avg_humidity',
      'min_humidity',
      'max_humidity',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['avg_temp']['type'] = 'decimal';
    $properties['min_temp']['type'] = 'decimal';
    $properties['max_temp']['type'] = 'decimal';
    $properties['deg_days']['type'] = 'decimal';
    $properties['avg_humidity']['type'] = 'decimal';
    $properties['min_humidity']['type'] = 'decimal';
    $properties['max_humidity']['type'] = 'decimal';
    $properties['meter_nid']['type'] = 'node';

    return $info;
  }

}
