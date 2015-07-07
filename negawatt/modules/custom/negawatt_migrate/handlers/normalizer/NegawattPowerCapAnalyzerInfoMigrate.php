<?php

/**
 * @file NegawattElectricityRawMigrate.php
 * Contains \NegawattElectricityRawMigrate.
 */

class NegawattPowerCapAnalyzerInfoMigrate extends Migration {

  public $entityType = 'power_cap_analyzer_info';
  public $bundle = 'normalizer';

  public $csvColumns = array(
    array('id', 'Unique ID'),
    array('weekday', 'weekday'),
    array('hour_from', 'hour_from'),
    array('hour_to', 'hour_to'),
    array('cap', 'cap'),
    array('meter_nid', 'meter_nid'),
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
      'weekday',
      'hour_from',
      'hour_to',
      'cap',
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
      $query = db_select('_negawatt_power_cap_analyzer_info_migrate', $this->bundle)
        ->fields($this->bundle, $field_names);
      $this->source = new MigrateSourceSQL($query);
    }
    else {
      // CSV migration.
      // Allow using variable to set path other than default.
      $csv_path = variable_get('negawatt_migrate_csv_path', drupal_get_path('module', 'negawatt_migrate') . '/csv');
      $this->source = new MigrateSourceCSV($csv_path . '/normalizer/' . $this->entityType . '.csv', $this->csvColumns, array('header_rows' => 1));
    }
    $this->destination = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
  }

  public function prepare($entity, $row) {
    $entity->meter_nid = reset($entity->meter_nid);
  }
}
