<?php

$plugin = array(
  'label' => t('IEC Meters'),
  'description' => t('List of meters of iec.'),
  'resource' => 'iec_meters',
  'class' => 'NegawattIecMeterResource',
  'name' => 'iec_meter__1_0',
  'entity_type' => 'node',
  'bundle' => 'iec_meter',
  'authentication_types' => TRUE,
  // Add totals to output.
  'formatter' => 'meters_total',
);
