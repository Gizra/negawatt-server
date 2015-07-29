<?php
/**
 * @file
 * negawatt_site.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function negawatt_site_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function negawatt_site_node_info() {
  $items = array(
    'meter_site' => array(
      'name' => t('Meter Site'),
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
