<?php

/**
 * @file
 * Contains NtIecMeterResource.
 */
class NtIecMeterResource extends \NtEntityBaseNode
{
  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['contract'] = array(
      'property' => 'field_contract_id'
    );

    $public_fields['place_description'] = array(
      'property' => 'field_address',
      'sub_property' => 'premise',
    );

    $public_fields['place_locality'] = array(
      'property' => 'field_address',
      'sub_property' => 'locality',
    );

    $public_fields['place_address'] = array(
      'property' => 'field_address',
      'sub_property' => 'thoroughfare',
    );

    $public_fields['country'] = array(
      'property' => 'field_address',
      'sub_property' => 'country',
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
