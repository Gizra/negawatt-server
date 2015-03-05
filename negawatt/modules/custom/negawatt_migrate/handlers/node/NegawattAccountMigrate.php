<?php

/**
 * @file
 * Contains \NegawattAccountMigrate.
 */

class NegawattAccountMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'account';

  public $csvColumns = array(
    array('field_account_type', 'Type'),
    array('field_location', 'Location'),
    array('field_geo_zoom', 'field_geo_zoom'),
    array('field_logo', 'Logo'),
  );

  public function __construct($arguments = array()) {
    parent::__construct($arguments);

    // Map fields that don't need extra definitions.
    $field_names = array(
      'field_location',
      'field_account_type',
      'field_geo_zoom',
    );
    $this->addSimpleMappings($field_names);

    $this
      ->addFieldMapping(OG_GROUP_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping(OG_ACCESS_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping('uid')
      ->defaultValue('1');

    $this->addFieldMapping('field_logo', 'field_logo');
    $this
      ->addFieldMapping('field_logo:file_replace')
      ->defaultValue(FILE_EXISTS_REPLACE);
    $this
      ->addFieldMapping('field_logo:source_dir')
      ->defaultValue(drupal_get_path('module', 'negawatt_migrate') . '/images');
  }

  /**
   * Map field_location and field_address fields.
   */
  public function prepare($entity, $row) {
    $row->field_location = explode('|', $row->field_location);

    $wrapper = entity_metadata_wrapper('node', $entity);
    $wrapper->field_location->set(array(
        'lat' => +$row->field_location[0],
        'lng' => +$row->field_location[1],
    ));
  }
}
