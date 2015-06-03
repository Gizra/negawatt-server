<?php
/**
 * @file
 * negawatt_message.features.field_base.inc
 */

/**
 * Implements hook_field_default_field_bases().
 */
function negawatt_message_field_default_field_bases() {
  $field_bases = array();

  // Exported field_base: 'field_meter'
  $field_bases['field_meter'] = array(
    'active' => 1,
    'cardinality' => 1,
    'deleted' => 0,
    'entity_types' => array(),
    'field_name' => 'field_meter',
    'foreign keys' => array(),
    'indexes' => array(
      'target_id' => array(
        0 => 'target_id',
      ),
    ),
    'locked' => 0,
    'module' => 'entityreference',
    'settings' => array(
      'handler' => 'base',
      'handler_settings' => array(
        'behaviors' => array(
          'views-select-list' => array(
            'status' => 0,
          ),
        ),
        'sort' => array(
          'type' => 'none',
        ),
        'target_bundles' => array(
          'iec_meter' => 'iec_meter',
          'modbus_meter' => 'modbus_meter',
        ),
      ),
      'target_type' => 'node',
    ),
    'translatable' => 0,
    'type' => 'entityreference',
  );

  return $field_bases;
}
