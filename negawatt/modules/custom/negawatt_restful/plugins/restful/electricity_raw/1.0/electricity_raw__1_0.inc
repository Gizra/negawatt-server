<?php

$plugin = array(
  'label' => t('Electricity Raw Data'),
  'description' => t('Electricity Raw consumption data from the contract or meters.'),
  'resource' => 'electricity_raw',
  'bundle' => 'electricity_raw',
  'class' => 'NegawattElectricityRawResource',
  'name' => 'electricity_raw__1_0',
  'entity_type' => 'electricity_raw',
  'authentication_types' => TRUE,
);
