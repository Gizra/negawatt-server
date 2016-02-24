<?php

/**
 * @file
 * Contains NegawattSensorDataRawResource.
 */

class NegawattSensorDataRawResource extends RestfulEntityBase {

  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Remove not necessary fields.
    unset($public_fields['label'], $public_fields['self']);

    $public_fields['timestamp'] = array(
      'property' => 'timestamp'
    );

    $public_fields['data'] = array(
      'property' => 'data'
    );

    $public_fields['sensor'] = array(
      'property' => 'meter_nid',
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency',
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
    // Check if an sensor entity with the same parameters exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'sensor_data_raw')
      ->propertyCondition('meter_nid', $this->request['sensor'])
      ->propertyCondition('timestamp', $this->request['timestamp'])
      ->propertyCondition('frequency', $this->request['frequency'])
      ->range(0,1)
      ->execute();

    if (!empty($result['sensor_data_raw'])) {
      // Node exists, update it.
      $id = key($result['sensor_data_raw']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }
}
