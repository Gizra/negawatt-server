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
 * Implements hook_query_TAG_alter().
 *
 * Test for either last-processed field is NULL, or it's earlier than the time
 * given in $query->negawatt_options_time (which will be set to REQUEST_TIME)
 * by the caller.
 */
function negawatt_server_query_electricity_last_processed_condition_alter(QueryAlterableInterface $query) {
  $query->leftJoin('field_data_field_last_processed', 'lp', 'node.nid = lp.entity_id');
  $or = db_or()
    ->isNull('lp.field_last_processed_value')
    ->condition('lp.field_last_processed_value', $query->negawatt_options_time, '<');
  $query
    ->condition($or);
}


/**
 * Process meters' raw data.
 *
 * Run over given meter ids and process their raw data.
 * Calls negawatt_normalizer_process_meters_once() repeatedly to process
 * all meters.
 *
 * @param array $meter_ids
 *   Array of meter-ids to process. If NULL or empty array, run over all the
 *   meters from least updated to the most recent.
 * @param array $options
 *   Extra options to add to the query when no meter IDs are provided. Optional
 *   keys are:
 *   - start_id: Result should include only node IDs equal or higher then this
 *     value. Defaults to FALSE which indicates no restriction on the node ID
 *     should be done.
 *   - range: How many nodes to include in each internal loop. Defaults to 50.
 *   - time: Include only meters that their last-processed field is EARLIER
 *     than this value. Defaults to REQUEST_TIME.
 */
function negawatt_normalizer_process_meters($meter_ids = array(), $options = array()) {
  // Set default options.
  $options += array(
    'range' => 50,
    'start_id' => FALSE,
    'time' => REQUEST_TIME,
  );

  if (!empty($meter_ids)) {
    // A list of meter-ids was given, process them and return.
    negawatt_normalizer_process_meters_once($meter_ids);
    return;
  }

  $bundles = array(
    'iec_meter',
    'satec_meter',
  );

  // Prepare basic query that will be used later
  $base_query = new EntityFieldQuery();
  $base_query
    ->entityCondition('entity_type', 'node')
    ->entityCondition('bundle', $bundles, 'IN')
    ->propertyCondition('status', NODE_PUBLISHED)
    // Use hook_query_TAG_alter to add a condition to include only meters that
    // their last-processed field is earlier than $options['time'] (or is NULL).
    // That will eliminate the meters that were already processed under the
    // current request.
    ->addTag('electricity_last_processed_condition');

  $base_query->negawatt_options_time = $options['time'];

  if ($options['start_id']) {
    $base_query->propertyCondition('nid', $options['start_id'], '>=');
  }

  // Count the meters.
  $query = clone $base_query;
  $meters_count = $query
    ->count()
    ->execute();

  if (!$meters_count) {
    drush_log('No meters required for processing.');
    return;
  }

  // Add sort to base query.
  $base_query
    ->fieldOrderBy('field_last_processed', 'value')
    ->fieldOrderBy('field_meter_processed', 'value');

  $params = array(
    '@count' => $meters_count,
    '@delta' => $options['range'],
  );
  drush_log(format_string('Looping for meters. meters-count=@count, range=@delta.', $params));

  for ($count = 0; $count < $meters_count; $count += $options['range']) {

    // Get meter IDs that need to be processed.
    $query = clone $base_query;
    $result = $query
      ->range(0, $options['range'])
      ->execute();

    $meter_ids = array_keys($result['node']);

    negawatt_normalizer_process_meters_once($meter_ids);
  }
}

/**
 * Process meters' raw data.
 *
 * Run over given meter ids and process their raw data.
 *
 * @param array $meter_ids
 *   Array of meter-ids to process.
 */
function negawatt_normalizer_process_meters_once($meter_ids = array()) {
  drush_log('Entering negawatt_normalizer_process_meters_once().');
  $count = count($meter_ids);
  $delta = 0;
  $total_entities_count = 0;

  foreach ($meter_ids as $meter_id) {
    ++$delta;

    $wrapper = entity_metadata_wrapper('node', $meter_id);
    $params = array(
      '@id' => $meter_id,
      '@count' => $count,
      '@delta' => $delta,
      '@meter_type' => $wrapper->getBundle(),
      '@meter_name' => $wrapper->label(),
    );
    drush_log(format_string('Processing meter ID @id (@delta/@count) [@meter_type, @meter_name]', $params));

    try {
      $result = negawatt_normalizer_process_meter($meter_id);

      // Log results.
      $entities_count = count($result);
      $total_entities_count += $entities_count;
      $entities_delta = 0;
      foreach ($result as $entity) {
        ++$entities_delta;
        drush_log(format_string(' electricity-entity @delta/@count:', array('@count' => $entities_count, '@delta' => $entities_delta)));

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
  drush_log(format_string('Total electricity-entities returned: @count', array('@count'=> $total_entities_count)));
}
