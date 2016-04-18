<?php

/**
 * @file NegawattPaymentRawMigrate.php
 * Contains \NegawattPaymentRawMigrate.
 */

class NegawattPaymentRawMigrate extends Migration {

  public $entityType = 'payment_raw';
    public $bundle = 'payment';

  public $csvColumns = array(
    array('id', 'Unique ID'),
    array('timestamp', 'timestamp'),
    array('payment_type', 'payment_type'),
    array('frequency', 'frequency'),
    array('meter_nid', 'meter_nid'),
    array('amount', 'amount'),
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
      'payment_type',
      'frequency',
      'amount',
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
      $query = db_select('_negawatt_payment_migrate', $this->bundle)
        ->fields($this->bundle, $field_names);
      $this->source = new MigrateSourceSQL($query);
    }
    else {
      // CSV migration.
      // Allow using variable to set path other than default.
      $csv_path = variable_get('negawatt_migrate_csv_path', drupal_get_path('module', 'negawatt_migrate') . '/csv');
      $this->source = new MigrateSourceCSV($csv_path . '/payment/' . $this->entityType . '.csv', $this->csvColumns, array('header_rows' => 1));
    }
    $this->destination = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
  }

  public function prepare($entity, $row) {
    $entity->meter_nid = reset($entity->meter_nid);
    $entity->timestamp = strtotime($entity->timestamp);
  }
}
