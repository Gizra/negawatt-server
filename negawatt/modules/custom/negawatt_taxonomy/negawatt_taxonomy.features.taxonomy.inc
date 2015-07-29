<?php
/**
 * @file
 * negawatt_taxonomy.features.taxonomy.inc
 */

/**
 * Implements hook_taxonomy_default_vocabularies().
 */
function negawatt_taxonomy_taxonomy_default_vocabularies() {
  return array(
    'meter_category' => array(
      'name' => 'Meter Category',
      'machine_name' => 'meter_category',
      'description' => 'Dummy vocab, used to allow migration.',
      'hierarchy' => 0,
      'module' => 'taxonomy',
      'weight' => 0,
    ),
    'site_category' => array(
      'name' => 'Site Category',
      'machine_name' => 'site_category',
      'description' => 'Site classification',
      'hierarchy' => 0,
      'module' => 'taxonomy',
      'weight' => 0,
    ),
  );
}