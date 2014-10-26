<?php

/**
 * @file
 * Contains NegawattElectricityRawValidator
 */

class NegawattElectricityRawValidator extends EntityValidateBase {

  /**
   * Overrides EntityValidateBase::getFieldsInfo().
   */
  public function getFieldsInfo() {
    $fields = parent::getFieldsInfo();

    $fields['meter_nid']['validators'][] = 'validateElectricityRawExist';

    return $fields;
  }

  /**
   * Validate that the electricity raw data was created.
   */
  public function validateElectricityRawExist($field_name, $value, \EntityMetadataWrapper $wrapper) {
    $timestamp = $wrapper->timestamp->value();
    $type = $wrapper->type->value();
    $rate_type = $wrapper->rate_type->value();

    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'electricity_raw')
      ->propertyCondition('meter_nid', $value)
      ->propertyCondition('timestamp', $timestamp)
      ->propertyCondition('type', $type)
      ->propertyCondition('rate_type', $rate_type)
      ->range(0, 1)
      ->count()
      ->execute();

    if ($result) {
      // Return the Error.
      $this->setError($field_name, 'The @field already has electricity raw data saved.');
    }
  }
}
