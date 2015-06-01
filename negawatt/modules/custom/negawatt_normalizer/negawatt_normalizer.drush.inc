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
      'start_id'  => dt('Process meters with node ID higher than this value.'),
      'range'     => dt('The number of nodes to process in each batch.'),
      'time_from' => dt('Process entities with date-time higher than this value.'),
      'time_to'   => dt('Process entities with date-time lower than this value.'),
    ),
  );

  $items['reset-last-processed'] = array(
    'description' => dt('Reset meters` last-processed flag.'),
  );

  $items['clear-normalized-electricity'] = array(
    'description' => dt('Clear normalized electricity table in the database.'),
  );

  return $items;
}

/**
 * Clear normalized electricity table in the database.
 */
function drush_negawatt_normalizer_clear_normalized_electricity() {
  db_truncate('negawatt_electricity_normalized')->execute();
}

/**
 * Reset meters` last-processed flag.
 */
function drush_negawatt_normalizer_reset_last_processed() {
  $bundles = array(
    'iec_meter',
    'modbus_meter',
  );

  $query = new EntityFieldQuery();
  $query
    ->entityCondition('entity_type', 'node')
    ->entityCondition('bundle', $bundles, 'IN')
    ->propertyCondition('status', NODE_PUBLISHED);
  $result = $query->execute();
  $meter_ids = array_keys($result['node']);
  $nodes = node_load_multiple($meter_ids);

  foreach ($nodes as $node) {
    // Reset meter-processed and last-processed fields for the meter
    $wrapper = entity_metadata_wrapper('node', $node);
    $wrapper->field_meter_processed->set(FALSE);
    $wrapper->field_last_processed->set(0);
    $wrapper->save();
  }
}

/**
 * Process meters' raw data.
 *
 * Run over given meter ids and process their raw data.
 * If none were given, take up to 50 meters. From least recently updated
 * meter to the current, and process.
 */
function drush_negawatt_normalizer_process_meter() {
  $meter_start_id = drush_get_option('start_id');
  $options = array();
  $options['range']     = drush_get_option('range', 50);
  $options['time_from'] = drush_get_option('time_from') ? strtotime(drush_get_option('time_from')) : 0;
  $options['time_to']   = drush_get_option('time_to') ? strtotime(drush_get_option('time_to')) : REQUEST_TIME;
  negawatt_normalizer_process_meters($meter_start_id, $options);
}


/**
 * Implements hook_query_TAG_alter().
 *
 * Test for either last-processed field is NULL, or it's in the time frame
 * given in $query->negawatt_options_time_from and _to.
 */
function negawatt_server_query_electricity_last_processed_condition_alter(QueryAlterableInterface $query) {
  $query->leftJoin('field_data_field_last_processed', 'lp', 'node.nid = lp.entity_id');
  $and = db_and()
    ->condition('lp.field_last_processed_value', $query->negawatt_options_time_from, '>=')
    ->condition('lp.field_last_processed_value', $query->negawatt_options_time_to, '<');
  $or = db_or()
    ->isNull('lp.field_last_processed_value')
    ->condition($and);
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
 * @param  $meter_start_id
 *   The lowest meter-id to process. If NULL, run over all the meters from
 *   least updated to the most recent.
 * @param array $options
 *   Extra options to add to the query when no meter IDs are provided. Optional
 *   keys are:
 *   - range: How many nodes to include in each internal loop. Defaults to 50.
 *   - time_from, time_to: Include only meters that their last-processed field
 *     is between these values. Defaults to 1/1/1970-REQUEST_TIME.
 */
function negawatt_normalizer_process_meters($meter_start_id, $options = array()) {
  // Set default options.
  $options += array(
    'range' => 50,
    'time_from' => 0,
    'time_to' => REQUEST_TIME,
  );

  // Set timezone
  // @fixme: allow each account have its own timezone.
  date_default_timezone_set('Asia/Jerusalem');

  drush_log('time options: '.date('Y-m-d H:i', $options['time_from']) . '-' . date('Y-m-d H:i', $options['time_to']));

  $bundles = array(
    'iec_meter',
    'modbus_meter',
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

  $base_query->negawatt_options_time_from = $options['time_from'];
  $base_query->negawatt_options_time_to = $options['time_to'];

  if ($meter_start_id) {
    $base_query->propertyCondition('nid', $meter_start_id, '>=');
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

  // @todo: Add sort by field_last_processed, field_meter_processed to base query.

  // Count meters corresponding to the query
  // Get meter IDs that need to be processed.
  $query = clone $base_query;
  $valid_meters_count = $query
    ->count()
    ->execute();

  $params = array(
    '@valid_count' => $valid_meters_count,
    '@count' => $meters_count,
    '@delta' => $options['range'],
    '@time' => date('Y-m-d H:i', $options['time_from']) . '-' . date('Y-m-d H:i', $options['time_to']),
  );
  drush_log(format_string('Looping for meters. meters-count=@valid_count out of @count, range=@delta, time-frame=@time.', $params));

  for ($count = 0; $count < $valid_meters_count; $count += $options['range']) {
    // Loop with 'range' sized groups and call negawatt_normalizer_process_meters_once()
    // Get meter IDs that need to be processed.
    $query = clone $base_query;
    $result = $query
      ->range($count, $options['range'])
      ->execute();

    drush_log(format_string('Query returned @count meters.', array('@count' => count($result['node']))));

    // Process a batch of meters.
    $meter_ids = array_keys($result['node']);
    negawatt_normalizer_process_meters_once($meter_ids, $options['time_from'], $options['time_to']);
  }
}

/**
 * Process meters' raw data.
 *
 * Run over a given group of meter ids (according to 'range' option) and
 * process their raw data.
 *
 * @param array $meter_ids
 *   Array of meter-ids to process.
 * @param null|int $from_timestamp
 *    Beginning of time period. If NULL, will be set to the last_processed time of the meter node
 * @param null|int $to_timestamp
 *    End of time period. If NULL, will be set to now.
 */
function negawatt_normalizer_process_meters_once($meter_ids = array(), $from_timestamp = NULL, $to_timestamp = NULL) {
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
      $result = negawatt_normalizer_process_meter($meter_id, $from_timestamp, $to_timestamp);

      // Log results.
      drush_log('Back at negawatt_normalizer_process_meters_once.');
      $frequencies_count = count($result);
      $frequencies_delta = 0;
      foreach ($result as $frequency => $timestamps_array) {
        ++$frequencies_delta;
        drush_log(format_string(' frequency @frequency, @delta/@count:', array(
          '@frequency' => $frequency . '(' . negawatt_normalizer_frequency_to_string($frequency) . ')',
          '@count' => $frequencies_count,
          '@delta' => $frequencies_delta
        )));

        $timestamps_count = count($timestamps_array);
        $timestamps_delta = 0;
        foreach ($timestamps_array as $timestamp => $electricity_array) {
          ++$timestamps_delta;
          drush_log(format_string('  timestamp @timestamp, @delta/@count:', array(
            '@timestamp' => date('Y-m-d H:i', $timestamp),
            '@count' => $timestamps_count,
            '@delta' => $timestamps_delta
          )));

          $entities_count = count($electricity_array);
          $total_entities_count += $entities_count;
          $entities_delta = 0;
          foreach ($electricity_array as $entity) {
            ++$entities_delta;
            drush_log(format_string('   electricity-entity @delta/@count:', array(
              '@count' => $entities_count,
              '@delta' => $entities_delta
            )));

            drush_log(format_string('    type: @frequency', array('@frequency' => $entity->frequency)));
            drush_log(format_string('    timestamp: @timestamp', array('@timestamp' => date('Y-m-d H:i', $entity->timestamp))));
            drush_log(format_string('    rate_type: @type', array('@type' => $entity->rate_type)));
            drush_log(format_string('    sum_kwh: @sum', array('@sum' => $entity->sum_kwh)));
            drush_log(format_string('    avg_power: @avg', array('@avg' => $entity->avg_power)));
            drush_log(format_string('    min_power_factor: @pf', array('@pf' => $entity->min_power_factor)));
          }
          drush_log('');
        }
        drush_log(' -------');
      }
      drush_log('-----');
    }
    catch (Exception $e) {
      drush_log('Processing failed: @msg.', array('@msg', $e->getMessage()));
    }
  }
  drush_log(format_string('Total electricity-entities returned: @count', array('@count'=> $total_entities_count)));
}

/**
 * Convert frequency int to string.
 *
 * @param $frequency
 *    Int frequency.
 *
 * @return string
 *    String frequency.
 */
function negawatt_normalizer_frequency_to_string($frequency) {
  switch ($frequency) {
    case 1:
      return 'Year';
    case 2:
      return 'Month';
    case 3:
      return 'Day';
    case 4:
      return 'Hour';
    case 5:
      return 'Minute';
  }
}
