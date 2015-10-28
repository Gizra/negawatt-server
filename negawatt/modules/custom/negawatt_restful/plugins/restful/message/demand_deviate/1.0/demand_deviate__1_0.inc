<?php

$plugin = array(
  'label' => t('Demand deviation warning'),
  'resource' => 'demand_deviate',
  'name' => 'demand_deviate__1_0',
  'entity_type' => 'message',
  'bundle' => 'demand_deviate',
  'description' => t('List warnings when demand deviate from last year`s demand.'),
  'class' => 'NegawattMessageDemandDeviate',
  'authentication_types' => TRUE,
);