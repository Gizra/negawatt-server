<?php

$plugin = array(
  'label' => t('Climate Raw Data'),
  'description' => t('Climate Raw consumption data from the contract or meters.'),
  'resource' => 'climate_raw',
  'bundle' => 'climate_raw',
  'class' => 'NegawattClimateRawResource',
  'name' => 'climate_raw__1_0',
  'entity_type' => 'climate_raw',
  'authentication_types' => TRUE,
);
