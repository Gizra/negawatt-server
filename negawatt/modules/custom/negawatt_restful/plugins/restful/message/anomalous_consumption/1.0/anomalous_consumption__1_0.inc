<?php

$plugin = array(
  'label' => t('Anomalous consumption warning'),
  'resource' => 'anomalous_consumption',
  'name' => 'anomalous_consumption__1_0',
  'entity_type' => 'message',
  'bundle' => 'anomalous_consumption',
  'description' => t('List warnings regarding anomalous consumption.'),
  'class' => 'NegawattMessageAnomalousConsumption',
  'authentication_types' => TRUE,
);