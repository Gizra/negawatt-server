<?php

$plugin = array(
  'label' => t('Sensor data'),
  'description' => t('Data from various sensor_datas.'),
  'resource' => 'sensor_data',
  'bundle' => 'sensor_data',
  'class' => 'NegawattSensorDataResource',
  'name' => 'sensor_data__1_0',
  'entity_type' => 'sensor_data',
  'authentication_types' => TRUE,
  'data_provider_options' => array(
    'table_name' => 'negawatt_sensor_data_normalized',
    'id_column' => 'id',
  ),
  'formatter' => 'electricity_total',
);
