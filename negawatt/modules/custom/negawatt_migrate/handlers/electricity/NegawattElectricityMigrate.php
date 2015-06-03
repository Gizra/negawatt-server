<?php

/**
 * @file NegawattElectricityMigrate.php
 * Contains \NegawattElectricityMigrate.
 */

class NegawattElectricityMigrate extends Migration {

  public $entityType = 'electricity';
  public $bundle = 'electricity';

  public $csvColumns = array(
    array('id', 'Unique ID'),
    array('frequency', 'frequency'),
    array('timestamp', 'timestamp'),
    array('rate_type', 'rate_type'),
    array('meter_nid', 'meter_nid'),
    array('sum_kwh', 'sum_kwh'),
    array('avg_power', 'avg_power'),
    array('min_power_factor', 'min_power_factor'),
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
      'frequency',
      'timestamp',
      'rate_type',
      'meter_nid',
      'sum_kwh',
      'avg_power',
      'min_power_factor',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping('meter_nid', 'meter_nid')
      ->sourceMigration(array('NegawattIecMeterMigrate','NegawattModbusMeterMigrate'));

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
      $query = db_select('_negawatt_electricity_normalized_migrate', $this->bundle)
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
