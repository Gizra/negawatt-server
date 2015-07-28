<?php

$plugin = array(
  'label' => t('Meter Site'),
  'resource' => 'meter_categories',
  'name' => 'meter_site__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'meter_site',
  'description' => t('Export the "Meter Site" taxonomy term.'),
  'class' => 'NegawattTaxonomyTermMeterSite',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
);
