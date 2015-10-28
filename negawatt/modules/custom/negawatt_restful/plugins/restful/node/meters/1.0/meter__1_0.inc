<?php

$plugin = array(
  'label' => t('Meters'),
  'description' => t('List of meters.'),
  'resource' => 'meters',
  'class' => 'NegawattMeterResource',
  'name' => 'meter__1_0',
  'entity_type' => 'node',
  'bundles' => array(
    'iec_meter' => 'iec_meters',
    'modbus_meter' => 'modbus_meters',
  ),
  'authentication_types' => TRUE,
  // Add totals to output.
  'formatter' => 'meters_total',
);
