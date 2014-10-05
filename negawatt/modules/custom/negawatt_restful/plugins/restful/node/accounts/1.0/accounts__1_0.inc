<?php

$plugin = array(
  'label' => t('Accounts'),
  'description' => t('List of accounts of negawatts. An account is actualy an OG group.'),
  'resource' => 'accounts',
  'class' => 'NtAccountsResource',
  'name' => 'accounts__1_0',
  'entity_type' => 'node',
  'bundle' => 'account',
  'authentication_types' => TRUE,
);
