<?php
/**
 * @file
 * occupancy_meter.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function occupancy_meter_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function occupancy_meter_node_info() {
  $items = array(
    'occupancy_meter' => array(
      'name' => t('Occupancy meter'),
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
