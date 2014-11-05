<?php

/**
 * @file
 * Contains \NegawattItemStatusTermsMigrate.
 */

/**
 * Migrate Meter-category taxonomy terms.
 */

class NegawattMeterCategoryTermsMigrate extends Migration {

  public $entityType = 'taxonomy_term';
  public $bundle = 'meter_category';

  protected $csvColumns = array(
    array('id', 'Unique ID'),
    array('name', 'mame'),
    array('parent', 'parent'),
    array('weight', 'weight'),
    array('description', 'description'),
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

  /**
   * Override Migration::prepare().
   *
   * Set the term parent for heirarchical terms
   *
   * @param $term
   * @param $row
   */
  public function prepare($term, $row) {
    $term->name = ucwords(trim($term->name));
    $parent = ucwords(trim($row->parent));
    $parent_term = taxonomy_get_term_by_name($parent, $this->bundle);
    $parent_term = reset($parent_term);
    if ($parent_term) {
      $term->parent = $parent_term->tid;
    }
  }
}
