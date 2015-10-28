<?php

$plugin = array(
  'label' => t('Meter Category'),
  'resource' => 'meter_categories',
  'name' => 'meter_category__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'meter_category',
  'description' => t('Export the "Meter Category" taxonomy term.'),
  'class' => 'NegawattTaxonomyTermMeterCategory',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
);
