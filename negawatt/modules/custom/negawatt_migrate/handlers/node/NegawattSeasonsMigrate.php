<?php

/**
 * @file
 * Contains \NegawattSeasonsMigrate.
 */

class NegawattSeasonsMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'season';

  public $csvColumns = array(
    array(OG_AUDIENCE_FIELD, 'Company'),
    array('field_season_status', 'Status'),
  );

  public $dependencies = array(
    'NegawattCompaniesMigrate',
    'NegawattSeasonStatusTermsMigrate',
  );

  public function __construct() {
    parent::__construct();

    $this
      ->addFieldMapping(OG_AUDIENCE_FIELD, OG_AUDIENCE_FIELD)
      ->sourceMigration('NegawattCompaniesMigrate');

    $this
      ->addFieldMapping('field_season_status', 'field_season_status')
      ->sourceMigration('NegawattSeasonStatusTermsMigrate');
  }
}
