<?php
/**
 * @file
 * negawatt_sensor.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function negawatt_sensor_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function negawatt_sensor_node_info() {
  $items = array(
    'sensor' => array(
      'name' => t('Sensor'),
      'base' => 'node_content',
      'description' => '',
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  drupal_alter('node_info', $items);
  return $items;
}
