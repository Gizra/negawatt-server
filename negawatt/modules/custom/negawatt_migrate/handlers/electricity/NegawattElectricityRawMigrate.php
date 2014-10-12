<?php

/**
 * @file NegawattElectricityRawMigrate.php
 * Contains \NegawattElectricityRawMigrate.
 */

class NegawattElectricityRawMigrate extends Migration {

  public $entityType = 'electricity_raw';
    public $bundle = 'electricity';

  public $csvColumns = array(
    array('id', 'Unique ID'),
    array('type', 'type'),
    array('timestamp', 'timestamp'),
    array('rate_type', 'rate_type'),
    array('meter_nid', 'meter_nid'),
    array('cumulative_kwh', 'cumulative_kwh'),
    array('power_factor', 'power_factor'),
    array('cumulative_kwh_l1', 'cumulative_kwh_l1'),
    array('cumulative_kwh_l2', 'cumulative_kwh_l2'),
    array('cumulative_kwh_l3', 'cumulative_kwh_l3'),
    array('power_factor_l1', 'power_factor_l1'),
    array('power_factor_l2', 'power_factor_l2'),
    array('power_factor_l3', 'power_factor_l3'),
  );

  public $dependencies = array(
    'NegawattIecMeterMigrate',
  );

  public function __construct() {
    parent::__construct();

    // Map fields that don't need extra definitions.
    $field_names = array(
      'id',
      'type',
      'timestamp',
      'rate_type',
      'cumulative_kwh',
      'power_factor',
      'cumulative_kwh_l1',
      'cumulative_kwh_l2',
      'cumulative_kwh_l3',
      'power_factor_l1',
      'power_factor_l2',
      'power_factor_l3',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping('meter_nid', 'meter_nid')
      ->sourceMigration('NegawattIecMeterMigrate');

    $this->description = t('Import @type - from CSV file.', array('@type' => $this->entityType));

    // Create a map object for tracking the relationships between source rows
    $key = array(
      'id' => array(
        'type' => 'int',
        'not null' => TRUE,
      ),
    );

    $destination_handler = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
    $this->map = new MigrateSQLMap($this->machineName, $key, $destination_handler->getKeySchema($this->entityType));

    // Create a MigrateSource object.
    $this->source = new MigrateSourceCSV(drupal_get_path('module', 'negawatt_migrate') . '/csv/electricity/' . $this->entityType . '.csv', $this->csvColumns, array('header_rows' => 1));
    $this->destination = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
  }

  public function prepare($entity, $row) {
    $entity->meter_nid = reset($entity->meter_nid);
  }
}
