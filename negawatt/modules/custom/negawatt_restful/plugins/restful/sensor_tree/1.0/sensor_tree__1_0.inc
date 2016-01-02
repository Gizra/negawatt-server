<?php

$plugin = array(
  'label' => t('Sensor tree'),
  'description' => t('The tree of categories, meters and sensors.'),
  'resource' => 'sensor_tree',
  'bundle' => 'sensor_tree',
  'class' => 'NegawattSensorTreeResource',
  'name' => 'sensor_tree__1_0',
  'entity_type' => 'node',
  'authentication_types' => TRUE,
);
