<?php

$plugin = array(
  'label' => t('Modbus Meters'),
  'description' => t('List of Modbus (or otherwise equal) meters.'),
  'resource' => 'modbus_meters',
  'class' => 'NegawattModbusMeterResource',
  'name' => 'modbus_meter__1_0',
  'entity_type' => 'node',
  'bundle' => 'modbus_meter',
  'authentication_types' => TRUE,
  // Add totals to output.
  'formatter' => 'meters_total',
);
