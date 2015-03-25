<?php

/**
 * @file
 * Contains NegawattIecMeterValidator.
 */

class NegawattIecMeterValidator extends EntityValidateBase {

  /**
   * Overrides NodeValidate::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $fields['field_contract_id']['validators'][] = array($this, 'validateMeterExist');

    return $fields;
  }

  /**
   * Validate that the meter already exist.
   */
  public function validateMeterExist($field_name, $value, EntityMetadataWrapper $wrapper, EntityMetadataWrapper $property_wrapper) {
    $meter_serial = $wrapper->field_meter_serial->value();

    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'iec_meter')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition('field_contract_id', 'value', $value)
      ->fieldCondition('field_meter_serial', 'value', $meter_serial)
      ->execute();

    if (empty($result['node'])) {
      // Continue saving the record if not exist.
      return;
    }

    // If the node found is the same as the wrapper (that is, we're in update
    // mode), don't complaint.
    $keys = array_keys($result['node']);
    if (count($keys) == 1 && $keys[0] == $wrapper->getIdentifier()) {
      return;
    }

    $params = array('@serial' => $meter_serial);
    $this->setError($field_name, 'The @field already has a meter with this serial @serial.', $params);
  }

}
