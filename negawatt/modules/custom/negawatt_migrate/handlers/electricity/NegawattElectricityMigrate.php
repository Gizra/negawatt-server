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
    array('type', 'type'),
    array('timestamp', 'timestamp'),
    array('rate_type', 'rate_type'),
    array('meter_nid', 'meter_nid'),
    array('avg_power', 'avg_power'),
    array('min_power_factor', 'min_power_factor'),
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
      'avg_power',
      'min_power_factor',
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
