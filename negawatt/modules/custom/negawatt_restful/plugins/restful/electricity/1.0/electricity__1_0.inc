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
  // Output the data in our own formatter.
  'formatter' => 'electricity_hal_json',
);
