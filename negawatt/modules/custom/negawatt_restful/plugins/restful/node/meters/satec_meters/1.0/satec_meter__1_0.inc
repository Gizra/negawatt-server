<?php

$plugin = array(
  'label' => t('Satec Meters'),
  'description' => t('List of Satec (or otherwise equal) meters.'),
  'resource' => 'satec_meters',
  'class' => 'NegawattSatecMeterResource',
  'name' => 'satec_meter__1_0',
  'entity_type' => 'node',
  'bundle' => 'satec_meter',
  'authentication_types' => TRUE,
  // Add totals to output.
  'formatter' => 'meters_total',
);
