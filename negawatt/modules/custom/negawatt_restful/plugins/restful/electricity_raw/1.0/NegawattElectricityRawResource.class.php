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

    $public_fields['type'] = array(
      'property' => 'type'
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

    return $public_fields;
  }
}
