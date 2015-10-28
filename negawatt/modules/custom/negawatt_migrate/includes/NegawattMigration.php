<?php

/**
 * @file
 * Contains \NegawattMigration.
 */

abstract class NegawattMigration extends Migration {

  public function __construct($arguments = array()) {
    parent::__construct($arguments);

    // Make sure we can use it for node and term only.
    if (!in_array($this->entityType, array('node', 'taxonomy_term'))) {
      throw new Exception('\NegawattMigration supports only nodes and terms.');
    }

    $this->description = t('Import @type - @bundle from CSV file.', array('@type' => $this->entityType, '@bundle' => $this->bundle));

    $this->csvColumns = !empty($this->csvColumns) ? $this->csvColumns : array();
    $csv_cols[] = array('Unique_ID', 'Unique_ID');

    if ($this->entityType == 'node') {
      $this->addFieldMapping('title', 'title');
      $class_name = 'MigrateDestinationNode';
      $csv_cols[] = array('title', 'Title');
    }
    elseif ($this->entityType == 'taxonomy_term') {
      $this->addFieldMapping('name', 'name');
      $class_name = 'MigrateDestinationTerm';
      $csv_cols[] = array('name', 'Name');
    }

    // Rebuild the csv columns array.
    $this->csvColumns = array_merge($csv_cols, $this->csvColumns);

    // Create a map object for tracking the relationships between source rows
    $key = array(
      'Unique_ID' => array(
        'type' => 'varchar',
        'length' => 255,
        'not null' => TRUE,
      ),
    );

    $destination_handler = new MigrateDestinationEntityAPI($this->entityType, $this->bundle);
    $this->map = new MigrateSQLMap($this->machineName, $key, $destination_handler->getKeySchema($this->entityType));

    // Create a MigrateSource object.
    $sql_migrate = variable_get('negawatt_migrate_sql', FALSE);
    if ($sql_migrate) {
      // SQL migration.
      // Prepare sql column names from csvColumns
      $sqlColumns = array();
      foreach ($this->csvColumns as $col) {
        $sqlColumns[] = $col[0];
      }
      $query = db_select('_negawatt_' . $this->bundle . '_migrate', $this->bundle)
        ->fields($this->bundle, $sqlColumns);
      $this->source = new MigrateSourceSQL($query);
    }
    else {
      // CSV migration.
      // Allow using variable to set path other than default.
      $csv_path = variable_get('negawatt_migrate_csv_path', drupal_get_path('module', 'negawatt_migrate') . '/csv');
      $this->source = new MigrateSourceCSV($csv_path . '/' . $this->entityType . '/' . $this->bundle . '.csv', $this->csvColumns, array('header_rows' => 1));
    }
    $this->destination = new $class_name($this->bundle, array('text_format' => 'filtered_html'));
  }
}
