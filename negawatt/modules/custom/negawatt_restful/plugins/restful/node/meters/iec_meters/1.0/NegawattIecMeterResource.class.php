<?php

/**
 * @file
 * Contains NegawattIecMeterResource.
 */
class NegawattIecMeterResource extends \NegawattEntityMeterBase {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['contract'] = array(
      'property' => 'field_contract_id',
    );

    $public_fields['meter_code'] = array(
      'property' => 'field_meter_code',
    );

    $public_fields['meter_serial'] = array(
      'property' => 'field_meter_serial',
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
      ->propertyCondition('type', array('iec_meter', 'satec_meter'), 'IN')
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
