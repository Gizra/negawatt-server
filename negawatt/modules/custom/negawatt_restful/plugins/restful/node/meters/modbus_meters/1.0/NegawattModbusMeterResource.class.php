<?php

/**
 * @file
 * Contains NegawattModbusMeterResource.
 */
class NegawattModbusMeterResource extends \NegawattEntityMeterBase {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['meter_type'] = array(
      'property' => 'field_meter_type',
    );

    $public_fields['ip_address'] = array(
      'property' => 'field_meter_ip_address',
    );

    $public_fields['ip_port'] = array(
      'property' => 'field_meter_port',
    );

    $public_fields['meter_id'] = array(
      'property' => 'field_meter_id',
    );

    $public_fields['meter_mac_address'] = array(
      'property' => 'field_mac_address',
    );

    return $public_fields;
  }
}
