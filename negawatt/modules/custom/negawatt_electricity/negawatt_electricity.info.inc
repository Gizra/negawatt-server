<?php

/**
 * @file
 * Contains ElectricityMetadataController, ElectricityRawMetadataController.
 */

class ElectricityMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['meter_nid'] = array(
      'label' => t('Meter'),
      'type' => 'integer', //  should be 'node'?
      'description' => t("The node (meter) this measurement belongs to."),
      'getter callback' => 'entity_property_getter_method',
      'setter callback' => 'entity_property_setter_method',
      'schema field' => 'meter_nid',
      'required' => TRUE,
    );

    $properties['timestamp'] = array(
      'type' => 'date',
      'description' => t('The time the message has been logged.'),
    ) + $properties['timestamp'];

    return $info;
  }
}


class ElectricityRawMetadataController extends EntityDefaultMetadataController {

  public function entityPropertyInfo() {
    $info = parent::entityPropertyInfo();
    $properties = &$info[$this->type]['properties'];

    $properties['meter_nid'] = array(
      'label' => t('Meter'),
      'type' => 'integer', //  should be 'node'?
      'description' => t("The node (meter) this measurement belongs to."),
      'getter callback' => 'entity_property_getter_method',
      'setter callback' => 'entity_property_setter_method',
      'schema field' => 'meter_nid',
      'required' => TRUE,
    );

    $properties['timestamp'] = array(
        'type' => 'date',
        'description' => t('The time the message has been logged.'),
      ) + $properties['timestamp'];

    return $info;
  }
}
