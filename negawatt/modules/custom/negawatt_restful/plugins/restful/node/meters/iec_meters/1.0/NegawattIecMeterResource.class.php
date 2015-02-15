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
}
