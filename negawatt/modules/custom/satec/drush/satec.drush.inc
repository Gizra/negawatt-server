<?php
/**
 * @file
 * Drush integration of HV notify.
 *
 */

/**
 * Implement hook_drush_help().
 */
function satec_drush_help($section) {
  switch ($section) {
    case 'drush:satec_read_registers':
      return dt('Read electricity values and save file.');
  }
}

/**
 * Implement hook_drush_command().
 */
function satec_drush_command() {
  $items = array();

  $items['satec_read_registers'] = array(
    'callback' => 'satec_read_registers',
    'drupal dependencies' => array(),
    'description' => 'Read electricity values and save to DB.',
    'description' => 'Read electricity values and save to DB.',
    'options' => array(
      'address' => 'IP address of modbus server',
      'user_id' => 'ID of the user to save the info to',
      'reference' => 'Reference to start reading from',
      'quantity' => 'Lenght of data',
      'debug' => 'Get dpm info with dd',
    ),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_CONFIGURATION,
    'aliases' => array('satec'),
    'examples' => array(
      'drush satec --address=212.235.53.12 --reference=13500 --quantity=10' =>' get 10 32bit values from address 13500.',
      'drush satec' =>'L1 kw from ecolink',
    ),
  );

  return $items;
}

/**
 * Callback function for sending digest email command.
 */
function satec_read_registers() {
  $address = drush_get_option('address', '212.235.53.12');
  $uid = drush_get_option('user_id', 1);
  $debug = drush_get_option('debug', FALSE);


  $requests = array(
    array('reference' => 287, 'quantity' => 2),
    array('reference' => 13318, 'quantity' => 1),
  );
  // See page 18 of PDF attached to understand each address:
  // 3.2 16-bit Scaled Analog Registers and Energy Meters - Basic Register Set

  // Reference : 256-308
  //+31 kWh import (low) 0-9999 1kWh UINT16 R 5
  //+32 kWh import (high) 0-9999 ×10MWh UINT16 R 5
  // Get total power usage count.
  $timestamp = time();
  $data = array();
  foreach ($requests as $request) {
    $data[] = satec_read_modbus($request['reference'], $request['quantity'] , $address, $debug);
  }
  if (!$data[0]) {
    // Send notification on error.
    drupal_mail('satec', 'error-connection', 'brice@gizra.com', 'en');
    drush_print($data);
    return FALSE;
  }
  drush_print_r($data[0]);
  if ($debug) {
     dd('Reading data: ' . date('c'));
  }

  if (!satec_write_regs_to_file($data, $timestamp, $uid, $debug)) {
    $msg = 'Error writing file';
    drush_print($msg);
    dd($msg);
  }
}

/**
 * Write result to todays file.
 */
function satec_write_regs_to_file($data, $timestamp, $uid, $debug = FALSE) {
  // Parse power usage from array.
  // In $data, [1] and [0] positions are the lower part of the number, whereas
  // [1] notates 1-99 and [0] notates 100-9900. Same goes for the higher number
  // with [3] and [2] respectively, starting at 10,000.
  $consumption = $data[0][1] + ($data[0][0] * 100) + (($data[0][3] + ($data[0][2] * 100)) * 10000);
  $current_consumption = $data[1][1];

  if (!$file_path = satec_get_storage_file_path($timestamp, $uid)) {
    drush_print('Unable to create dir.');
    dd('Unable to create dir.');
    return FALSE;
  }
  
  // Begining of month
  if ((date('j',$timestamp) == '1' || !file_exists(satec_get_storage_file_path($timestamp - (60 * 60 * 24), $uid))) && !file_exists($file_path)) {
    // First file of the month - save the total consumption in the user entity.
    $wrapper = entity_metadata_wrapper('user', $uid);
    // NOTE: Uses current consumption - acceptable difference from actual last
    // month's consumption.
    $wrapper->field_start_consumption->set($consumption);
    $wrapper->field_start_date->set($timestamp);
    $wrapper->save();
  }

  $handler = fopen($file_path, 'a');
  if (!$handler) {
    drush_print('Unable to create file');
    dd('Unable to create dir file');
    return FALSE;
  }
  if ($debug) {
     dd('wrote to file: ' . $file_path);
  }
  $res = fwrite($handler,"$timestamp\t$consumption\t$current_consumption\n");
  fclose($handler);
  drush_print($file_path);
  return TRUE;
}

/**
 * Read a register and return an erray with results.
 */
function satec_read_modbus($reference = 287, $quantity = 2, $address = '212.235.53.12', $debug = FALSE) {
  require_once(drupal_get_path('module','satec') . '/Phpmodbus/Phpmodbus/ModbusMasterTcp.php');
  $modbus = new ModbusMasterTcp($address);

  try {
   $moduleId = 1;
   $recData = $modbus->readMultipleRegisters($moduleId, $reference, $quantity);
   if ($debug) {
     dd($recData);
   }
   return $recData;

  }
  catch (Exception $e) {
    //drush_print_r($e);
    drush_print_r('Cannot read registers.');
    dd(dt('Unbale to read registers: @reference.', array('@reference' => $referece)), 'error');
    return FALSE;
  }
}
