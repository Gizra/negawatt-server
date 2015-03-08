<?php

/**
 * @file
 * Contains \NegawattIecMeterMigrate.
 */

class NegawattIecMeterMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'iec_meter';

  public $csvColumns = array(
    array('account', 'Account ref'),
    array('field_location', 'Location'),
    array('field_contract_id', 'Contract ID'),
    array('field_place_locality', 'Locality'),
    array('field_place_address', 'Address'),
    array('field_place_description', 'Place Description'),
    array('field_meter_code', 'Meter Code'),
    array('field_meter_serial', 'Meter Serial'),
    array('country', 'Country'),
    array('field_last_processed', 'Last processed'),
    array(OG_VOCAB_FIELD, 'Meter category'),
    array('field_max_frequency', 'Max frequency'),
  );

  public $dependencies = array(
    'NegawattAccountMigrate',
    'NegawattMeterCategoryTermsMigrate',
  );

  public function __construct() {
    parent::__construct();

    // Map fields that don't need extra definitions.
    $field_names = array(
      'field_location',
      'field_contract_id',
      'field_place_locality',
      'field_place_address',
      'field_place_description',
      'field_meter_code',
      'field_meter_serial',
      'country',
      'field_last_processed',
      'field_max_frequency',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping(OG_AUDIENCE_FIELD, 'account')
      ->sourceMigration('NegawattAccountMigrate');

    $this
      ->addFieldMapping(OG_ACCESS_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping('uid')
      ->defaultValue('1');

    $this
      ->addFieldMapping(OG_VOCAB_FIELD, OG_VOCAB_FIELD)
      ->sourceMigration('NegawattMeterCategoryTermsMigrate')
      ->separator('|');
  }

  /**
   * Map field_location and field_address fields.
   */
  public function prepare($entity, $row) {
    $row->field_location = explode('|', $row->field_location);

    $wrapper = entity_metadata_wrapper('node', $entity);
    $wrapper->field_location->set(array(
      'lat' => $row->field_location[0],
      'lng' => $row->field_location[1],
    ));

    $wrapper->field_address->set(array(
      'country' => $row->country,
      'locality' => $row->field_place_locality,
    ));
  }
}
