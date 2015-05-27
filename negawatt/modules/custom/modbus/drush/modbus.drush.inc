<?php
/**
 * @file
 * Drush integration of HV notify.
 *
 */

/**
 * Implement hook_drush_help().
 */
function modbus_drush_help($section) {
  switch ($section) {
    case 'drush:modbus_read_registers':
      return dt('Read electricity values and save in raw-electricity table.');
  }
}

/**
 * Implement hook_drush_command().
 */
function modbus_drush_command() {
  $items = array();

  $items['modbus_read_meter'] = array(
    'callback' => 'modbus_read_meter',
    'drupal dependencies' => array(),
    'description' => 'Read electricity values and save to DB.',
    'options' => array(
      'meter_id' => 'Meter ID.',
      'debug' => 'Get dpm info with dd',
    ),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_CONFIGURATION,
    'aliases' => array('modbus'),
    'examples' => array(
      'drush modbus_read_meter --meter_id=123' =>' Read data from meter 123.',
      'drush modbus_read_meter' =>' Read data from all modbus meters.',
    ),
  );

  return $items;
}

/**
 * Callback function for reading meter command.
 */
function modbus_read_meter() {
  $debug = drush_get_option('debug', FALSE);
  $meter_id = drush_get_option('meter_id', FALSE);

  if ($meter_id) {
    modbus_read_one_meter($meter_id);
    return;
  }

  // Meter-ID was not given, loop for all modbus meter nodes
  $query = new EntityFieldQuery();
  $result = $query->entityCondition('entity_type', 'node')
    ->entityCondition('bundle', array('modbus_meter'), 'IN')
    ->propertyCondition('status', NODE_PUBLISHED)
    ->execute();

  if (empty($result['node'])) {
    drush_log('Meters of type modbus were not found.', 'error');
    return FALSE;
  }

  $meter_ids = array_keys($result['node']);
  foreach ($meter_ids as $meter_id) {
    modbus_read_one_meter($meter_id);
  }
}

/**
 * Read data from one Modbus meter and store it in raw-electricity table.
 *
 * @param $meter_id
 *    Node ID of the meter.
 *
 * @return bool
 *    True if everything went fine.
 */
function modbus_read_one_meter($meter_id) {
  // Look for meter node.
  $node = node_load($meter_id);
  if (!$node) {
    drush_log(format_string('Meter id @meter_id was not found.', array('@meter_id' => $meter_id)), 'error');
    return FALSE;
  }

  drush_log(format_string('Node @meter_id loaded', array('@meter_id' => $meter_id)), 'ok');

  // Get meter properties from node
  $wrapper = entity_metadata_wrapper('node', $meter_id);
  $meter_type = $wrapper->field_meter_type->value();
  $address = $wrapper->field_meter_ip_address->value();
  $modbus_id = $wrapper->field_meter_id->value();
  $meter_port = $wrapper->field_meter_port->value();

  drush_log('Meter ip address = '.$address, 'ok');

  // Prepare set of registers to read.
  $requests = array(
    'satec' => array(
      // 1 Second total KW.
      array('reference' => 14336 + 00, 'quantity' => 2, 'signed' => TRUE),
      // 1 Second total PF.
      array('reference' => 14336 + 06, 'quantity' => 2, 'signed' => TRUE),
      // Total sum kWh.
      array('reference' => 14720 + 00, 'quantity' => 2, 'signed' => FALSE),
      // Phase sum kWh.
      array('reference' => 14848 + 00, 'quantity' => 2, 'signed' => FALSE),
      array('reference' => 14848 + 02, 'quantity' => 2, 'signed' => FALSE),
      array('reference' => 14848 + 04, 'quantity' => 2, 'signed' => FALSE),
      // 1 Second phase PF.
      array('reference' => 13952 + 30, 'quantity' => 2, 'signed' => TRUE),
      array('reference' => 13952 + 32, 'quantity' => 2, 'signed' => TRUE),
      array('reference' => 13952 + 34, 'quantity' => 2, 'signed' => TRUE),
    ),
    // @fixme: put correct values for elnet meter here.
    'elnet' => array(
      // 1 Second total W.
      array('reference' => 25, 'quantity' => 2, 'signed' => TRUE),
      // 1 Second total PF.
      array('reference' => 49, 'quantity' => 2, 'signed' => TRUE),
      // Total sum Wh.
      array('reference' => 1385, 'quantity' => 2, 'signed' => FALSE),
      // Phase sum Wh.
      array('reference' => 1319, 'quantity' => 2, 'signed' => FALSE),
      array('reference' => 1321, 'quantity' => 2, 'signed' => FALSE),
      array('reference' => 1323, 'quantity' => 2, 'signed' => FALSE),
      // 1 Second phase PF.
      array('reference' => 43, 'quantity' => 2, 'signed' => TRUE),
      array('reference' => 45, 'quantity' => 2, 'signed' => TRUE),
      array('reference' => 47, 'quantity' => 2, 'signed' => TRUE),
    ),
  );

  // Read registers.
  $timestamp = time();
  $data = array();
  foreach ($requests[$meter_type] as $request) {
    $data[] = modbus_read_modbus_32bit_registers($request, $address, $modbus_id, $meter_port);
  }

  if (!$data[0]) {
    // Send notification on error.
    drush_log('Nothing was read from the meter.', 'error');
    drupal_mail('modbus', 'error-connection', 'brice@gizra.com', 'en');
    drush_print($data);
    return FALSE;
  }

  drush_log('Data received.', 'ok');

  // Save data onto db.
  if (!modbus_write_data_to_db($meter_id, $data, $timestamp)) {
    $msg = 'Error writing to db';
    drush_log($msg, 'error');
  }

  return TRUE;
}

/**
 * Write result to raw-electricity table.
 *
 * @param $meter_id
 *    Node ID of the meter.
 * @param $data
 *    Array of meter data.
 * @param $timestamp
 *    The time data was read.
 * @param bool $debug
 *    Display additional debug information.
 *
 * @return bool
 *    True if everything went fine.
 */
function modbus_write_data_to_db($meter_id, $data, $timestamp, $debug = FALSE) {
  // Create a new raw-electricity entity.
  $values = array(
    'type' => 'modbus',
    'meter_nid' => $meter_id,
    'timestamp' => $timestamp,
    'rate_type' => 'unknown',
    'kwh' => $data[2],
    'power_factor' => $data[1] / 1000,
    'kwh_l1' => $data[3],
    'kwh_l2' => $data[4],
    'kwh_l3' => $data[5],
    'power_factor_l1' => $data[6] / 1000,
    'power_factor_l2' => $data[7] / 1000,
    'power_factor_l3' => $data[8] / 1000,
  );

  $entity = entity_create('electricity_raw', $values);

  drush_log('entity created', 'ok');
  drush_print_r($values);

  $result = $entity->save();

  if ($result != SAVED_NEW) {
    drush_log(format_string('entity->save() returned @val instead of 1 (SAVED_NEW).', array('@val' => $result)), 'error');
    return FALSE;
  }

  return TRUE;
}

/**
 * Read a register and return an array with results.
 *
 * @param $request
 *    Array of request parameters:
 *    - reference: Register address.
 *    - quantity: Number of 16bit words to read.
 *    - signed: Is it a signed integer?
 * @param $address
 *    IP address of the meter.
 * @param int $modbus_id
 *    Modbus unit-ID of the meter (usually 1).
 * @param int $port
 *    Meter UDP port (usually 502).
 * @param bool $debug
 *    Show extra debug info?
 *
 * @return bool|int|number
 *    The value, if call succeeded, or FALSE if an error occurred.
 */
function modbus_read_modbus_32bit_registers($request, $address, $modbus_id = 1, $port = 502, $debug = FALSE) {
  // Extract request parameters.
  $reference = $request['reference'];
  $quantity = $request['quantity'];
  $signed = $request['signed'];

  // Set default values.
  $modbus_id = $modbus_id ? $modbus_id : 1;
  $port = $port ? $port : 502;

  require_once(drupal_get_path('module', 'modbus') . '/Phpmodbus/Phpmodbus/ModbusMasterTcp.php');
  $modbus = new ModbusMasterTcp($address, $port);

  try {
    // Read bytes from meter.
    $recData = $modbus->readMultipleRegisters($modbus_id, $reference, $quantity);

    // Calc value from returned bytes.
    $value = 0;
    for ($i = 0; $i < count($recData); $i += 2) {
      $value += ($recData[$i + 1] + $recData[$i] * 256) * pow(256, $i);
    }
    // If value is signed, and is higher then half the full-range (256^n, where n is the number of bytes),
    // then get the negative value by subtracting the full-range from the value.
    if ($signed) {
      $full_range = pow(256, count($recData));
      if ($value >= $full_range / 2) {
        $value -= $full_range;
      }
    }
    return $value;
  }
  catch (Exception $e) {
    drush_log('Cannot read registers. Error returned: ' . $e.message);
    return FALSE;
  }
}
