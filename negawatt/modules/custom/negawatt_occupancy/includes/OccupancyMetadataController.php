<?php

/**
 * @file
 * Contains OccupancyMetadataController.
 */

class OccupancyMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['timestamp'] = array(
      'type' => 'date',
      'setter callback' => 'entity_property_verbatim_set',
      'description' => t('The time the occupancy has been logged.'),
    ) + $properties['timestamp'];

    $field_names = array(
      'frequency',
      'meter_nid',
      'avg_occupancy',
      'min_occupancy',
      'max_occupancy',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['meter_nid']['type'] = 'node';
    $properties['avg_occupancy']['type'] = 'decimal';
    $properties['min_occupancy']['type'] = 'decimal';
    $properties['max_occupancy']['type'] = 'decimal';

    return $info;
  }

}
