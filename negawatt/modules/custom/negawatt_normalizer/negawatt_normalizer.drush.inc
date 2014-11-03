<?php

/**
 * @file
 * Drush integration for the Negawatt normalizer module.
 */

/**
 * Implements hook_drush_command().
 */
function negawatt_normalizer_drush_command() {
  $items['process-meter'] = array(
    'description' => dt('Process and normalize meter(s).'),
    'options' => array(
      'id' => dt('The node ID(s) of the meters.'),
    ),
  );

  return $items;
}

/**
 * Process meters' raw data.
 *
 * Run over given meter ids and process their raw data.
 * If none were given, take up to 50 meters. From least recently updated
 * meter to the current, and process.
 */
function drush_negawatt_normalizer_process_meter() {
  $meter_ids = drush_get_option('id');
  negawatt_normalizer_process_meters($meter_ids);
}

/**
 * Process meters' raw data.
 *
 * Run over given meter ids and process their raw data.
 *
 * @param array $meter_ids
 *    Array of meter-ids to process. If NULL of empty array, take 50 least
 *    recently updated meters.
 */
function negawatt_normalizer_process_meters($meter_ids = array()) {
  if (empty($meter_ids)) {
    $bundles = array(
      'iec_meter',
      'satec_meter',
    );
    // Get meter IDs that need to be processed.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', $bundles, 'IN')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldOrderBy('field_last_processed', 'value','DESC')
      ->range(0, 50)
      ->execute();

    if (empty($result['node'])) {
      drush_log('No meters required for processing.');
      return;
    }

    $meter_ids = array_keys($result['node']);
  }

  $count = count($meter_ids);
  $delta = 0;

  foreach ($meter_ids as $meter_id) {
    ++$delta;

    $wrapper = entity_metadata_wrapper('node', $meter_id);
    $params = array(
      '@id' => $meter_id,
      '@count' => $count,
      '@delta' => $delta,
      '@meter_type' => $wrapper->getBundle(),
    );
    drush_log(format_string('Processing meter ID @id (@delta/@count) [@meter_type]', $params));

    try {
      $result = negawatt_normalizer_process_meter($meter_id);

      // Log results.
      $entities_count = count($result);
      $entities_delta = 0;
      drush_log(format_string(' @count entities returned:', array('@count'=> $entities_count)));
      foreach ($result as $entity) {
        ++$entities_delta;
        drush_log(format_string(' entity @delta/@count:', array('@count' => $entities_count, '@delta' => $entities_delta)));

        drush_log(format_string('  type: @type', array('@type' => $entity->type)));
        drush_log(format_string('  timestamp: @timestamp', array('@timestamp' => date('Y-m-d H:i', $entity->timestamp))));
        drush_log(format_string('  rate_type: @type', array('@type' => $entity->rate_type)));
        drush_log(format_string('  avg_power: @avg', array('@avg' => $entity->avg_power)));
        drush_log(format_string('  min_power_factor: @pf', array('@pf' => $entity->min_power_factor)));
      }
      drush_log('');
    }
    catch (Exception $e) {
      drush_log('Processing failed: @msg.', array('@msg', $e->getMessage()));
    }
  }
}
