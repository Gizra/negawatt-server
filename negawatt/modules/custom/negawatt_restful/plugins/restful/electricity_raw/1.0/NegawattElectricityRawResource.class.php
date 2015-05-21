<?php

/**
 * @file
 * Contains NegawattElectricityRawResource.
 */

class NegawattElectricityRawResource extends RestfulEntityBase {

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

    $public_fields['rate_type'] = array(
      'property' => 'rate_type'
    );

    $public_fields['meter_type'] = array(
      'property' => 'meter_type'
    );

    $public_fields['power_factor'] = array(
      'property' => 'power_factor'
    );

    $public_fields['kwh'] = array(
      'property' => 'kwh'
    );

    $public_fields['meter'] = array(
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
    // Check if an electricity entity with the same parameters exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity_raw')
      ->propertyCondition('meter_nid', $this->request['meter'])
      ->propertyCondition('timestamp', $this->request['timestamp'])
      ->propertyCondition('meter_type', $this->request['meter_type'])
      ->propertyCondition('rate_type', $this->request['rate_type'])
      ->propertyCondition('frequency', $this->request['frequency'])
      ->range(0,1)
      ->execute();

    if (!empty($result['electricity_raw'])) {
      // Node exists, update it.
      $id = key($result['electricity_raw']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }

}
