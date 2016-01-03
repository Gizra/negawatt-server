<?php

$plugin = array(
  'label' => t('Test API'),
  'description' => t('Test authentication.'),
  'resource' => 'test',
  'class' => 'NegawattTestResource',
  'name' => 'test__1_0',
  'entity_type' => 'node',
  'authentication_types' => TRUE,
);
