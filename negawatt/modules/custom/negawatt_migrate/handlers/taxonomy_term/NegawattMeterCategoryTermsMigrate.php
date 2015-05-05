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
    array('account_id', 'account_id'),
    array('id', 'Unique ID'),
    array('name', 'mame'),
    array('parent', 'parent'),
    array('weight', 'weight'),
    array('description', 'description'),
    array('field_icon_categories', 'field_icon_categories'),
    array('field_match_strings', 'field_match_strings'),
  );

  public $dependencies = array(
    'NegawattAccountMigrate',
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
      'field_icon_categories',
      'field_match_strings',
    );

    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping('account_id', 'account_id')
      ->sourceMigration('NegawattAccountMigrate');

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
   * Set the term parent for hierarchical terms
   *
   * @param $term
   * @param $row
   */
  public function prepare($term, $row) {
    // Handle og_vocab
    $vocab_name = $this->bundle . '_' . $row->account_id;
    if (!$vocabulary = taxonomy_vocabulary_machine_name_load($vocab_name)) {
      // Create a new vocabulary
      $vocabulary = (object) array(
        'name' => 'Meter categories for ' . $row->account_id,
        'description' => 'Meter categories for ' . $row->account_id,
        'machine_name' => $vocab_name,
      );
      taxonomy_vocabulary_save($vocabulary);

      // Create an OG-vocab and relate new vocabulary with OG.
      $account_id = $term->account_id['destid1'];
      $settings = array(
        'cardinality' => 1,
        'required' => FALSE,
      );
      // Loop for all meter content-types and create og-vocabulary.
      $node_types = node_type_get_types();
      foreach ($node_types as $content_type) {
        if (strpos($content_type->type, '_meter') === FALSE) {
          // Not a meter type, skip.
          continue;
        }
        $og_vocab = og_vocab_create_og_vocab($vocabulary->vid, 'node', $content_type->type, OG_VOCAB_FIELD, $settings);
        $og_vocab->save();
      }
      og_vocab_relation_save($vocabulary->vid, 'node', $account_id);
    }

    // Save vocabulary id.
    $term->vid = $vocabulary->vid;

    // Handle parent.
    $term->name = ucwords(trim($term->name));
    $parent = ucwords(trim($row->parent));
    $parent_term = taxonomy_get_term_by_name($parent, $vocab_name);
    $parent_term = reset($parent_term);
    if ($parent_term) {
      $term->parent = $parent_term->tid;
    }
  }
}
