<?php

/**
 * Create a site node for each meter, and update the meter's site reference.
 *
 * Queries all meters that still have no site node, and creates a site for each
 * one. In case this script fails it will automatically continue from where it
 * stopped in its next run.
 *
 * drush scr profiles/negawatt/modules/custom/negawatt_meter/scripts/create_meter_site_nodes.php
 */

// Verify the site category vocabulary exist, to allow creating terms for the
// new sites.
if (!$vocabulary = taxonomy_vocabulary_machine_name_load('site_category')) {
  drush_log('Site category vocabulary does not exist.', 'error');
  return;
}

// Fetch the default meter category terms, for the new meter_category field.
if (!$vocabulary = taxonomy_vocabulary_machine_name_load('meter_category')) {
  drush_log('Meter category vocabulary does not exist.', 'error');
  return;
}
// Set the new meter category field to "ראשי חח״י" for iec meters,  and "Other"
// for modbus meters.
$default_modbus_category = _get_or_create_term('אחר', 'meter_category');
$default_iec_category = _get_or_create_term('ראשי חח"י', 'meter_category');

// Fetch all meters that still have no site referenced. Using db_select to allow
// easily selecting nodes having no value for the meter_site field.
$query = db_select('node', 'n')
  ->fields('n', array('nid'))
  ->orderBy('n.nid')
  ->condition('n.status', NODE_PUBLISHED)
  ->condition('n.type', array('iec_meter', 'modbus_meter'), 'IN');
// Find meters without a related "Meter site".
$query->leftJoin('field_data_field_meter_site', 'fms', "fms.entity_id = n.nid AND fms.entity_type = 'node'");
$query->condition('fms.field_meter_site_target_id', NULL);
$result = $query->execute()->fetchAllAssoc('nid');
$nids = array_keys($result);
if (!$nids) {
  drush_log('No meters without site found.', 'ok');
  return;
}

$range = 50;
$count = count($nids);
drush_log(format_string('Processing @count meters.', array('@count' => $count)), 'ok');

for ($delta = 0; $delta < $count; $delta += $range) {
  // Extract the next bulk of node IDs out of $nids.
  $nids_bulk = array_splice($nids, 0, $range);

  drush_log(format_string('Processing meter node IDs @first to @last.', array('@last' => end($nids_bulk), '@first' => reset($nids_bulk))), 'ok');

  // Process a bulk of 50 meters.
  foreach (node_load_multiple($nids_bulk) as $node) {
    drush_log(format_string('Processing meter #@nid.', array('@nid' => $node->nid)), 'ok');

    $site_nid = _create_site_node($node);

    drush_log(format_string('Created new site #@nid.', array('@nid' => $site_nid)), 'ok');

    // Update the meter node.
    $wrapper = entity_metadata_wrapper('node', $node);
    // Reference the new meter.
    $wrapper->field_meter_site->set($site_nid);
    // Set the new meter category field to "ראשי חח״י" for iec meters,
    // and "Other" for modbus meters.
    $wrapper->field_meter_category->set($node->type == 'iec_meter' ? $default_iec_category->tid : $default_modbus_category->tid);

    $wrapper->save();

    drush_log(format_string('Updated meter #@nid.', array('@nid' => $node->nid)), 'ok');
  }
}

drush_log('Finished.', 'ok');

/**
 * Create a site node for a meter node.
 *
 * @param object $meter_node
 *   The meter node.
 *
 * @return int
 *   The site node ID.
 */
function _create_site_node($meter_node) {
  // Import the old meter categories, which will be updated as the site categories.
  global $old_meter_categories;
  require_once 'old_meter_categories.php';

  $meter_wrapper = entity_metadata_wrapper('node', $meter_node);

  // Create the site node for the meter.
  $values = array(
    'type' => 'meter_site',
    'uid' => $meter_node->uid,
    'status' => NODE_PUBLISHED,
    'title' => $meter_node->title,
  );
  $site_node = entity_create('node', $values);
  $site_wrapper = entity_metadata_wrapper('node', $site_node);

  // Copy fields from the meter to the site node.
  $fields = array(
    'field_address',
    'field_image',
    'field_location',
    'field_location_valid',
    'field_place_address',
    'field_place_description',
    'field_place_locality',
    'og_group_ref',
  );
  foreach ($fields as $field) {
    $site_wrapper->$field->set($meter_wrapper->$field->value());
  }

  // Clear address fields in the meter itself
  $fields = array(
    array('field_address', array()),
    array('field_image', array()),
    array('field_location', array()),
    array('field_location_valid', FALSE),
    array('field_category_valid', TRUE),
    array('field_place_address', ''),
    array('field_place_locality', ''),
  );
  foreach ($fields as $field) {
    $meter_wrapper->$field[0]->set($field[1]);
  }

  // Set the meter category according to the old meter categories field.
  if (!empty($old_meter_categories[$meter_node->nid])) {
    $term = _get_or_create_term($old_meter_categories[$meter_node->nid]['name'], 'site_category');

    $site_wrapper->field_site_category->set($term->tid);
  }

  $site_wrapper->save();
  return $site_node->nid;
}

/**
 * Get an existing, or create a term.
 *
 * @param string $name
 *   Term name.
 * @param string $vocabulary_name
 *   Term's vocabulary machine name.
 *
 * @return object
 *   A taxonomy term.
 */
function _get_or_create_term($name, $vocabulary_name) {
  $vocabulary = taxonomy_vocabulary_machine_name_load($vocabulary_name);
  $terms = taxonomy_get_term_by_name($name, $vocabulary->machine_name);
  if ($terms) {
    $term = reset($terms);
  }
  else {
    // Create the term if it doesn't exist in the new vocabulary.
    $term = new stdClass();
    $term->name = $name;
    $term->vid = $vocabulary->vid;
    taxonomy_term_save($term);
  }

  return $term;
}