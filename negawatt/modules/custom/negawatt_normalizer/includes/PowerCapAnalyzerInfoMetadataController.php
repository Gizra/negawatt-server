<?php

/**
 * @file
 * Contains PowerCapAnalyzerInfoMetadataController.
 */

class PowerCapAnalyzerInfoMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $field_names = array(
      'weekday',
      'hour_from',
      'hour_to',
      'cap',
      'meter_nid',
    );

    foreach ($field_names as $property_name) {
      $properties[$property_name]['setter callback'] = 'entity_property_verbatim_set';
    }

    $properties['weekday']['type'] = 'decimal';
    $properties['hour_from']['type'] = 'decimal';
    $properties['hour_to']['type'] = 'decimal';
    $properties['cap']['type'] = 'float';
    $properties['meter_nid']['type'] = 'node';

    return $info;
  }

}
