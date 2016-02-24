<?php

$plugin = array(
  'label' => t('Sensor Type'),
  'resource' => 'sensor_types',
  'name' => 'sensor_type__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'sensor_type',
  'description' => t('Export the "Sensor Type" taxonomy term.'),
  'class' => 'NegawattTaxonomyTermSensorType',
  'authentication_types' => TRUE,
);
