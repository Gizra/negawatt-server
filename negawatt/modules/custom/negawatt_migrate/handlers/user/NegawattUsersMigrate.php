<?php

/**
 * @file
 * Contains \NegawattUsersMigrate.
 */

class NegawattUsersMigrate extends Migration {

  /**
   * Map the field and properties to the CSV header.
   */
  public $csvColumns = array(
    array('name', 'Username'),
    array('pass', 'Password'),
    array('mail', 'Email'),
    array('account', 'Group'),
  );

  public $entityType = 'user';

  public $dependencies = array(
    'NegawattAccountMigrate'
  );
  public function __construct() {
    parent::__construct();
    $this->description = t('Import users from a CSV file.');

    $this->addFieldMapping('name', 'name');
    $this->addFieldMapping('pass', 'pass');
    $this->addFieldMapping('mail', 'mail');

    $this
      ->addFieldMapping('og_user_node', 'account')
      ->sourceMigration('NegawattAccountMigrate');

    $this
      ->addFieldMapping('status')
      ->defaultValue(TRUE);

    // Create a map object for tracking the relationships between source rows
    $key = array(
      'id' => array(
        'type' => 'varchar',
        'length' => 255,
        'not null' => TRUE,
      ),
    );
    $destination_handler = new MigrateDestinationUser();
    $this->map = new MigrateSQLMap($this->machineName, $key, $destination_handler->getKeySchema());

    // Create a MigrateSource object.
    $this->source = new MigrateSourceCSV(drupal_get_path('module', 'negawatt_migrate') . '/csv/' . $this->entityType . '/user.csv', $this->csvColumns, array('header_rows' => 1));
    $this->destination = new MigrateDestinationUser();
  }
}
