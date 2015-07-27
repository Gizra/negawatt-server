<?php

/**
 * @file
 * Contains NegawattClimateMeterResource.
 */
class NegawattClimateMeterResource extends \NegawattEntityMeterBase {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

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
      ->propertyCondition('type', 'climate_meter')
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
