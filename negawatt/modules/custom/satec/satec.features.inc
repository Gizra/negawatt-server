<?php
/**
 * @file
 * satec.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function satec_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_node_info().
 */
function satec_node_info() {
  $items = array(
    'satec_meter' => array(
      'name' => t('Satec meter'),
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
