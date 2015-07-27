<?php

$plugin = array(
  'label' => t('Climate Meters'),
  'description' => t('List of meters of climate.'),
  'resource' => 'climate_meters',
  'class' => 'NegawattClimateMeterResource',
  'name' => 'climate_meter__1_0',
  'entity_type' => 'node',
  'bundle' => 'climate_meter',
  'authentication_types' => TRUE,
);
