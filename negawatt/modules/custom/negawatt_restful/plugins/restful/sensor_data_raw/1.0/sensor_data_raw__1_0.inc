<?php

$plugin = array(
  'label' => t('Sensor Raw Data'),
  'description' => t('Raw data from various sensors.'),
  'resource' => 'sensor_data_raw',
  'bundle' => 'sensor_data_raw',
  'class' => 'NegawattSensorDataRawResource',
  'name' => 'sensor_data_raw__1_0',
  'entity_type' => 'sensor_data_raw',
  'authentication_types' => TRUE,
);
