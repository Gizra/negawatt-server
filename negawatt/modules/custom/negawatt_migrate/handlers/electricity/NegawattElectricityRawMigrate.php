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
    array('meter_type', 'meter_type'),
    array('timestamp', 'timestamp'),
    array('rate_type', 'rate_type'),
    array('frequency', 'frequency'),
    array('meter_nid', 'meter_nid'),
    array('kwh', 'kwh'),
    array('power_factor', 'power_factor'),
    array('kwh_l1', 'kwh_l1'),
    array('kwh_l2', 'kwh_l2'),
    array('kwh_l3', 'kwh_l3'),
    array('power_factor_l1', 'power_factor_l1'),
    array('power_factor_l2', 'power_factor_l2'),
    array('power_factor_l3', 'power_factor_l3'),
  );

  public $dependencies = array(
    'NegawattIecMeterMigrate',
    'NegawattModbusMeterMigrate',
  );

  public function __construct() {
    parent::__construct();

    // Map fields that don't need extra definitions.
    $field_names = array(
      'id',
      'meter_type',
      'timestamp',
      'rate_type',
      'frequency',
      'meter_nid',
      'kwh',
      'power_factor',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping('meter_nid', 'meter_nid')
      ->sourceMigration(array('NegawattIecMeterMigrate', 'NegawattModbusMeterMigrate'));

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
    $sql_migrate = variable_get('negawatt_migrate_sql', FALSE);
    if ($sql_migrate) {
      // SQL migration.
      $query = db_select('_negawatt_electricity_migrate', $this->bundle)
        ->fields($this->bundle, $field_names);
      $this->source = new MigrateSourceSQL($query);
    }
    else {
      // CSV migration.
      // Allow using variable to set path other than default.
      $csv_path = variable_get('negawatt_migrate_csv_path', drupal_get_path('module', 'negawatt_migrate') . '/csv');
      $this->source = new MigrateSourceCSV($csv_path . '/electricity/' . $this->entityType . '.csv', $this->csvColumns, array('header_rows' => 1));
    }
    $this->destination = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
  }

  public function prepare($entity, $row) {
    $entity->meter_nid = reset($entity->meter_nid);
    $entity->timestamp = strtotime($entity->timestamp);
  }
}
