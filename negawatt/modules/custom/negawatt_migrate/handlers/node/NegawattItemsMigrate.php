<?php

/**
 * @file
 * Contains \NegawattItemsMigrate.
 */

class NegawattItemsMigrate extends NegawattMigration {

  public $entityType = 'node';
  public $bundle = 'item';

  public $csvColumns = array(
    array('body', 'Body'),
    array('field_season', 'Season'),
    array('field_item_status', 'Status'),
  );

  public $dependencies = array(
    'NegawattItemStatusTermsMigrate',
    'NegawattSeasonsMigrate',
  );

  public function __construct() {
    parent::__construct();

    $this->addFieldMapping('body', 'body');

    $this
      ->addFieldMapping('field_season', 'field_season')
      ->sourceMigration('NegawattSeasonsMigrate');

    $this
      ->addFieldMapping('field_item_status', 'field_item_status')
      ->sourceMigration('NegawattItemStatusTermsMigrate');
  }

}
