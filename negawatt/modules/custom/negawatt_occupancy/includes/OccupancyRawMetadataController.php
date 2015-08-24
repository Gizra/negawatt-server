<?php

/**
 * @file
 * Contains OccupancyRawMetadataController
 */

class OccupancyRawMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the raw occupancy has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'frequency',
      'meter_nid',
      'occupancy_abs',
      'occupancy_rel',
      'guests',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['meter_nid']['type'] = 'node';
    $properties['occupancy_abs']['type'] = 'decimal';
    $properties['occupancy_rel']['type'] = 'decimal';
    $properties['guests']['type'] = 'decimal';

    return $info;
  }

}
