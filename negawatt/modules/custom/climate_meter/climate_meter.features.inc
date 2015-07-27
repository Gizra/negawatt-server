<?php
/**
 * @file
 * climate_meter.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function climate_meter_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function climate_meter_node_info() {
  $items = array(
    'climate_meter' => array(
      'name' => t('Climate meter'),
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
