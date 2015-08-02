<?php

$plugin = array(
  'label' => t('Sites'),
  'description' => t('List of sites of negawatts.'),
  'resource' => 'sites',
  'class' => 'NegawattSitesResource',
  'name' => 'sites__1_0',
  'entity_type' => 'node',
  'bundle' => 'meter_site',
  'authentication_types' => TRUE,
);
