<?php

/**
 * @file
 * Drush integration for the Negawatt meter module.
 */

/**
 * Implements hook_drush_command().
 */
function negawatt_meter_drush_command() {
  $items['update-meter-titles'] = array(
    'description' => dt('Update meter titles'),
    'options' => array(
      'start_nid' => dt('Process meters with node ID higher than this value.'),
      'nid' => dt('Process meters with given node ID.'),
      'range' => dt('The number of nodes to process in each batch.'),
    ),
  );

  return $items;
}

/**
 * Drush callback.
 * Normalize meter titles according to negawatt_meter_get_meter_title().
 *
 * Optional drush arguments:
 *   - start_nid: Meter nid to start processing from.
 *   - nid: Process only a single meter with given id.
 *   - range: How many nodes to include in each internal loop. Defaults to 50.
 */
function drush_negawatt_meter_update_meter_titles() {
  $start_nid = drush_get_option('start_nid');
  $nid = drush_get_option('nid');
  $range = $nid ? 1 : drush_get_option('range', 50);
  $bundles = array('iec_meter', 'modbus_meter');

  // Basic meters query.
  $base_query = new EntityFieldQuery();
  $base_query
    ->entityCondition('entity_type', 'node')
    ->entityCondition('bundle', $bundles, 'IN')
    ->propertyCondition('status', NODE_PUBLISHED);

  if ($start_nid) {
    $base_query->propertyCondition('nid', $start_nid, '>=');
  }
  if ($nid) {
    $base_query->propertyCondition('nid', $nid);
  }

  // Count the meters.
  $query = clone $base_query;
  $count = $query->count()->execute();

  if (!$count) {
    drush_log('No meters found.', 'ok');
    return;
  }

  drush_log(format_string('Total @count meters. range: @range.', array('@count' => $count, '@range' => $range)), 'ok');

  for ($delta = 0; $delta < $count; $delta += $range) {
    $query = clone $base_query;
    $result = $query->range($delta, $range)->execute();

    drush_log(format_string('Query returned @count meters.', array('@count' => count($result['node']))), 'ok');

    // Process a batch of meters.
    foreach (node_load_multiple(array_keys($result['node'])) as $node) {
      drush_log(format_string('Processing node #@nid. Old title: @title.', array('@nid' => $node->nid, '@title' => $node->title)), 'ok');

      // Update the meter title.
      $node->title = negawatt_meter_get_meter_title($node);
      node_save($node);
      drush_log(format_string('New title: @title.', array('@title' => $node->title)), 'ok');
    }
  }

  drush_log('Finished.', 'ok');
}
