<?php

$plugin = array(
  'label' => t('Sensor Meters'),
  'description' => t('List of sensor.'),
  'resource' => 'sensors',
  'class' => 'NegawattSensorResource',
  'name' => 'sensor__1_0',
  'entity_type' => 'node',
  'bundle' => 'sensor',
  'authentication_types' => TRUE,
);
