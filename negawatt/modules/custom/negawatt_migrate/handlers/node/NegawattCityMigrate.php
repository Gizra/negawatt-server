<?php

/**
 * @file
 * Contains \NegawattCompaniesMigrate.
 */

class NegawattCityMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'company';

  public function __construct() {
    parent::__construct();
    $this
      ->addFieldMapping(OG_GROUP_FIELD)
      ->defaultValue(TRUE);

    $this
      ->addFieldMapping(OG_ACCESS_FIELD)
      ->defaultValue(TRUE);
  }

}
