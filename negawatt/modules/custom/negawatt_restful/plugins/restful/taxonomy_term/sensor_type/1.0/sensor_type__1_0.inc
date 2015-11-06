<?php

$plugin = array(
  'label' => t('Site Category'),
  'resource' => 'site_categories',
  'name' => 'site_category__1_0',
  'entity_type' => 'taxonomy_term',
  'bundle' => 'site_category',
  'description' => t('Export the "Site Category" taxonomy term.'),
  'class' => 'NegawattTaxonomyTermSiteCategory',
  'authentication_types' => TRUE,
  'authentication_optional' => TRUE,
);
