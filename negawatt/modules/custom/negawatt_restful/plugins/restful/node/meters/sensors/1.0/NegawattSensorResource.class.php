<?php

/**
 * @file
 * Contains NegawattSensorResource.
 */
class NegawattSensorResource extends \NegawattEntityMeterBase {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['sensor_type'] = array(
      'property' => 'field_sensor_type',
      'resource' => array(
        'sensor_type' => array(
          'name' => 'sensor_types',
          'full_view' => TRUE,
        ),
      ),
    );

    $public_fields['site'] = array(
      'property' => 'field_meter_site',
      'resource' => array(
        'meter_site' => array(
          'name' => 'sites',
          'full_view' => FALSE,
        ),
      ),
    );
    return $public_fields;
  }

  /**
   * {@inheritdoc}
   *
   * Override RestfulEntityBase::createEntity() to test if meter already exists,
   * to allow update existing nodes in stead of creating a copy.
   */
  public function createEntity() {
    // Check if a meter with the same label exists.
    $query = new EntityFieldQuery();
    $result = $query->entityCondition('entity_type', 'node')
      ->propertyCondition('type', 'sensor')
      ->propertyCondition('title', $this->request['label'])
      ->range(0,1)
      ->execute();

    if (!empty($result['node'])) {
      // Node exists, update it.
      $id = key($result['node']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }
}
