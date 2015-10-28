<?php

$plugin = array(
  'label' => t('Demand exceeds cap warning'),
  'resource' => 'demand_exceeds_cap',
  'name' => 'demand_exceeds_cap__1_0',
  'entity_type' => 'message',
  'bundle' => 'demand_exceeds_cap',
  'description' => t('List warnings when demand exceeds preset cap.'),
  'class' => 'NegawattMessageDemandExceedsCap',
  'authentication_types' => TRUE,
);