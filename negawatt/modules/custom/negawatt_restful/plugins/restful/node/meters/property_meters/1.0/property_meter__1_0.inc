<?php

$plugin = array(
  'label' => t('Property Meters'),
  'description' => t('List of property meters (e.g. temperature, occupancy, etc.).'),
  'resource' => 'property_meters',
  'class' => 'NegawattPropertyMeterResource',
  'name' => 'property_meter__1_0',
  'entity_type' => 'node',
  'bundles' => array(
    'climate_meter' => 'climate_meters',
  ),
  'authentication_types' => TRUE,
);
