<?php

/**
 * @file
 * Contains \NegawattNormalizationFactorTermsMigrate.
 */

/**
 * Migrate Sensor-type taxonomy terms.
 */

class NegawattNormalizationFactorTermsMigrate extends Migration {

  public $entityType = 'taxonomy_term';
  public $bundle = 'normalization_factor';

  protected $csvColumns = array(
    array('id', 'Unique ID'),
    array('name', 'mame'),
    array('weight', 'weight'),
    array('description', 'description'),
    array('field_units', 'field_units'),
  );

  public function __construct() {
    parent::__construct();

    $this->description = t('Import @bundle terms from CSV file.', array('@bundle' => $this->bundle));

    // Map fields that don't need extra definitions.
    $field_names = array(
      'id',
      'name',
      'weight',
      'description',
      'field_units',
    );

    $this->addSimpleMappings($field_names);

    // Create a map object for tracking the relationships between source rows
    $key = array(
      'id' => array(
        'type' => 'varchar',
        'length' => 255,
        'not null' => TRUE,
      ),
    );

    $destination_handler = new MigrateDestinationEntityAPI('taxonomy_term', $this->bundle);
    $this->map = new MigrateSQLMap($this->machineName, $key, $destination_handler->getKeySchema('taxonomy_term'));

    // Create a MigrateSource object.
    $csv_file = 'taxonomy_term/' . $this->bundle . '.csv';
    $this->source = new MigrateSourceCSV(drupal_get_path('module', 'negawatt_migrate') . '/csv/' . $csv_file, $this->csvColumns, array('header_rows' => 1));
    $this->destination = new MigrateDestinationTerm($this->bundle);
  }
}
