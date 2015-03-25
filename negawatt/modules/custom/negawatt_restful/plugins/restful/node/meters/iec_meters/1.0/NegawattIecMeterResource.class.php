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
    $entities = $query->entityCondition('entity_type', 'node')
      ->propertyCondition('type', array('iec_meter', 'satec_meter'), 'IN')
      ->propertyCondition('title', $this->request['label'])
      ->propertyCondition('status', NODE_PUBLISHED)
      ->range(0,1)
      ->execute();

    if (!empty($entities['node'])) {
      // Node exists, update it.
      return parent::updateEntity(array_keys($entities['node'])[0]);
    }
    // New node.
    return parent::createEntity();
  }
}
