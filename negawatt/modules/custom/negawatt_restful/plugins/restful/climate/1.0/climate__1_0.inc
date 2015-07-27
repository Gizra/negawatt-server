<?php

$plugin = array(
  'label' => t('Climate data'),
  'description' => t('Climate data from the meters.'),
  'resource' => 'climate',
  'bundle' => 'climate',
  'class' => 'NegawattClimateResource',
  'name' => 'climate__1_0',
  'entity_type' => 'climate',
  'authentication_types' => TRUE,
  'data_provider_options' => array(
    'table_name' => 'negawatt_climate_normalized',
    'id_column' => 'id',
  ),
);
