<?php

/**
 * @file
 * Contains NegawattIecMeterValidator.
 */

class NegawattIecMeterValidator extends EntityValidateBase {

  /**
   * Overrides NodeValidate::getFieldsInfo().
   */
  public function getFieldsInfo() {
    $fields = parent::getFieldsInfo();

    $fields['field_contract_id']['validators'][] = 'validateMeterExist';

    return $fields;
  }

  /**
   * Validate that the meter already exist.
   */
  public function validateMeterExist($field_name, $value, \EntityMetadataWrapper $wrapper) {
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

    $params = array('@serial' => $meter_serial);
    $this->setError($field_name, 'The @field already has a meter with this serial @serial.', $params);
  }

}
