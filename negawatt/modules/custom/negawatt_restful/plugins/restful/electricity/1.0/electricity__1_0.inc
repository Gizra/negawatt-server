<?php

$plugin = array(
  'label' => t('Electricity data'),
  'description' => t('Electricity consumption data from the contract or meters.'),
  'resource' => 'electricity',
  'bundle' => 'electricity',
  'class' => 'NegawattElectricityResource',
  'name' => 'electricity__1_0',
  'entity_type' => 'electricity',
  'authentication_types' => TRUE,
  'data_provider_options' => array(
    'table_name' => 'negawatt_electricity_normalized',
    'id_column' => 'id',
  ),
  'formatter' => 'electricity_total',
);
