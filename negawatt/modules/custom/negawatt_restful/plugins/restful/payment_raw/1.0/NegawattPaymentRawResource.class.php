<?php

/**
 * @file
 * Contains NegawattPaymentRawResource.
 */

class NegawattPaymentRawResource extends RestfulEntityBase {

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

    $public_fields['payment_type'] = array(
      'property' => 'payment_type'
    );

    $public_fields['amount'] = array(
      'property' => 'amount'
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
    // Check if an payment entity with the same parameters exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'payment_raw')
      ->propertyCondition('meter_nid', $this->request['meter'])
      ->propertyCondition('timestamp', $this->request['timestamp'])
      ->propertyCondition('payment_type', $this->request['payment_type'])
      ->propertyCondition('frequency', $this->request['frequency'])
      ->range(0,1)
      ->execute();

    if (!empty($result['payment_raw'])) {
      // Node exists, update it.
      $id = key($result['payment_raw']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }

}
