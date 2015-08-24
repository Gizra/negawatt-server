<?php

$plugin = array(
  'label' => t('Occupancy data'),
  'description' => t('Occupancy data from the meters.'),
  'resource' => 'occupancy',
  'bundle' => 'occupancy',
  'class' => 'NegawattOccupancyResource',
  'name' => 'occupancy__1_0',
  'entity_type' => 'occupancy',
  'authentication_types' => TRUE,
  'data_provider_options' => array(
    'table_name' => 'negawatt_occupancy_normalized',
    'id_column' => 'id',
  ),
);
