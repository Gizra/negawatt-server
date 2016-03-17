<?php

$plugin = array(
  'label' => t('Normalization Factor'),
  'resource' => 'normalization_factors',
  'name' => 'normalization_factor__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'normalization_factor',
  'description' => t('Export the "Normalization Factor" taxonomy term.'),
  'class' => 'NegawattTaxonomyTermNormalizationFactor',
  'authentication_types' => TRUE,
);
