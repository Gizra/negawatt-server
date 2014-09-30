<?php

/**
 * @file
 * Contains NtIecCounterResource.
 */
class NtIecCounterResource extends \NtEntityBaseNode
{
  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo()
  {
    $public_fields = parent::publicFieldsInfo();

    // Fields created by the scrapper server, in a post petition.
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

    $public_fields['counter_code'] = array(
      'property' => 'field_counter_code',
    );

    $public_fields['counter_serial'] = array(
      'property' => 'field_counter_serial',
    );

    return $public_fields;
  }
}
