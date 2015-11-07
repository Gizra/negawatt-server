<?php

/**
 * @file
 * Contains \NegawattSensorMigrate.
 */

class NegawattSensorMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'sensor';

  public $csvColumns = array(
    array('account', 'Account ref'),
    array('field_location', 'Location'),
    array('field_mac_address', 'MAC address'),
    array('field_place_locality', 'Locality'),
    array('field_place_address', 'Address'),
    array('field_place_description', 'Place Description'),
    array('field_meter_ip_address', 'Meter IP address'),
    array('field_meter_port', 'Meter port'),
    array('field_meter_id', 'Meter id'),
    array('country', 'Country'),
    array('field_last_processed', 'Last processed'),
    array('field_sensor_type', 'Sensor type'),
    array('field_meter_site', 'Meter site'),
    array('field_max_frequency', 'Max frequency'),
  );

  public $dependencies = array(
    'NegawattAccountMigrate',
    'NegawattSensorTypeTermsMigrate',
    'NegawattMeterSiteMigrate',
  );

  public function __construct() {
    parent::__construct();

    // Map fields that don't need extra definitions.
    $field_names = array(
      'field_location',
      'field_mac_address',
      'field_place_locality',
      'field_place_address',
      'field_place_description',
      'field_meter_ip_address',
      'field_meter_port',
      'field_meter_id',
      'country',
      'field_last_processed',
      'field_max_frequency',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping(OG_AUDIENCE_FIELD, 'account')
      ->sourceMigration('NegawattAccountMigrate');

    $this
      ->addFieldMapping('field_sensor_type', 'field_sensor_type')
      ->sourceMigration('NegawattSensorTypeTermsMigrate');

    $this
      ->addFieldMapping('field_meter_site', 'field_meter_site')
      ->sourceMigration('NegawattMeterSiteMigrate');
  }

  /**
   * Map field_location and field_address fields.
   */
  public function prepare($entity, $row) {
    if (!empty($row->field_location)) {
      $row->field_location = explode('|', $row->field_location);

      $wrapper = entity_metadata_wrapper('node', $entity);
      $wrapper->field_location->set(array(
        'lat' => $row->field_location[0] || 0,
        'lng' => $row->field_location[1] || 0,
      ));
    }

//    $wrapper->field_address->set(array(
//      'country' => $row->country,
//      'locality' => $row->field_place_locality,
//    ));
  }
}
