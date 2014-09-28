<?php

/**
 * @file
 * Contains \NegawattCompaniesMigrate.
 */

class NegawattAccountMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'account';

  public $csvColumns = array(
    array('field_account_type', 'Type'),
    array('field_location', 'Location'),
  );


  public function __construct() {
    parent::__construct();

    // Map fields that don't need extra definitions.
    $field_names = array(
      'field_account_type',
    );
    $this->addSimpleMappings($field_names);


    // Map location.
    $this->addFieldMapping('field_location:lat', 'field_location_lat');
    $this->addFieldMapping('field_location:lng', 'field_location_lng');


    $this
      ->addFieldMapping(OG_GROUP_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping(OG_ACCESS_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping('uid')
      ->defaultValue('1');
  }

  /**
   * Map location field.
   */
  public function prepareRow($row) {
    $row->field_location = explode('|', $row->field_location);
    $row->field_location_lat = $row->field_location[0];
    $row->field_location_lng =  $row->field_location[1];
  }
}
