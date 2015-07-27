<?php
/**
 * @file
 * negawatt_climate.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_climate_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'climate_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_climate_normalized';
  $view->human_name = 'Climate overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Climate overview';
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'none';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '25';
  $handler->display->display_options['style_plugin'] = 'table';
  $handler->display->display_options['style_options']['columns'] = array(
    'id' => 'id',
    'frequency' => 'frequency',
    'timestamp' => 'timestamp',
    'meter_nid' => 'meter_nid',
    'avg_temp' => 'avg_temp',
    'min_temp' => 'min_temp',
    'max_temp' => 'max_temp',
  );
  $handler->display->display_options['style_options']['default'] = 'frequency';
  $handler->display->display_options['style_options']['info'] = array(
    'id' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'frequency' => array(
      'sortable' => 1,
      'default_sort_order' => 'desc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'timestamp' => array(
      'sortable' => 1,
      'default_sort_order' => 'desc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'meter_nid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'avg_temp' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'min_temp' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'max_temp' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Climate data: Climate data ID */
  $handler->display->display_options['fields']['id']['id'] = 'id';
  $handler->display->display_options['fields']['id']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['id']['field'] = 'id';
  $handler->display->display_options['fields']['id']['label'] = 'ID';
  $handler->display->display_options['fields']['id']['separator'] = '';
  /* Field: Climate data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Climate data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Climate data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  /* Field: Climate data: Sum_temperature */
  $handler->display->display_options['fields']['avg_temp']['id'] = 'avg_temp';
  $handler->display->display_options['fields']['avg_temp']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['avg_temp']['field'] = 'avg_temp';
  $handler->display->display_options['fields']['avg_temp']['precision'] = '0';
  /* Field: Climate data: Avg_power */
  $handler->display->display_options['fields']['min_temp']['id'] = 'min_temp';
  $handler->display->display_options['fields']['min_temp']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['min_temp']['field'] = 'min_temp';
  /* Field: Climate data: Min_humidity */
  $handler->display->display_options['fields']['max_temp']['id'] = 'max_temp';
  $handler->display->display_options['fields']['max_temp']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['fields']['max_temp']['field'] = 'max_temp';
  $handler->display->display_options['fields']['max_temp']['precision'] = '0';
  /* Filter criterion: Climate data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['filters']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator_id'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['label'] = 'Meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['identifier'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Climate data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['filters']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['exposed'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator_id'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['label'] = 'Timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['identifier'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Climate data: Frequency */
  $handler->display->display_options['filters']['frequency']['id'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['table'] = 'negawatt_climate_normalized';
  $handler->display->display_options['filters']['frequency']['field'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['exposed'] = TRUE;
  $handler->display->display_options['filters']['frequency']['expose']['operator_id'] = 'frequency_op';
  $handler->display->display_options['filters']['frequency']['expose']['label'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['frequency']['expose']['operator'] = 'frequency_op';
  $handler->display->display_options['filters']['frequency']['expose']['identifier'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['frequency']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/climate-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Climate';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['climate_overview'] = $view;

  $view = new view();
  $view->name = 'climate_raw_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_climate';
  $view->human_name = 'Climate Raw overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Climate Raw overview';
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'none';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '25';
  $handler->display->display_options['style_plugin'] = 'table';
  $handler->display->display_options['style_options']['columns'] = array(
    'id_1' => 'id_1',
    'meter_type' => 'meter_type',
    'timestamp' => 'timestamp',
    'meter_nid' => 'meter_nid',
    'temperature' => 'temperature',
    'humidity' => 'humidity',
  );
  $handler->display->display_options['style_options']['default'] = 'timestamp';
  $handler->display->display_options['style_options']['info'] = array(
    'id_1' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'meter_type' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'timestamp' => array(
      'sortable' => 1,
      'default_sort_order' => 'desc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'meter_nid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'temperature' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'humidity' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Climate raw data: Climate raw data ID */
  $handler->display->display_options['fields']['id_1']['id'] = 'id_1';
  $handler->display->display_options['fields']['id_1']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['id_1']['field'] = 'id';
  $handler->display->display_options['fields']['id_1']['label'] = 'ID';
  $handler->display->display_options['fields']['id_1']['separator'] = '';
  /* Field: Climate raw data: Meter_type */
  $handler->display->display_options['fields']['meter_type']['id'] = 'meter_type';
  $handler->display->display_options['fields']['meter_type']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['meter_type']['field'] = 'meter_type';
  /* Field: Climate raw data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Climate raw data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Climate raw data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['separator'] = '';
  /* Field: Climate raw data: Kwh */
  $handler->display->display_options['fields']['temperature']['id'] = 'temperature';
  $handler->display->display_options['fields']['temperature']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['temperature']['field'] = 'temperature';
  $handler->display->display_options['fields']['temperature']['label'] = 'temperature';
  /* Field: Climate raw data: Power_factor */
  $handler->display->display_options['fields']['humidity']['id'] = 'humidity';
  $handler->display->display_options['fields']['humidity']['table'] = 'negawatt_climate';
  $handler->display->display_options['fields']['humidity']['field'] = 'humidity';
  $handler->display->display_options['fields']['humidity']['precision'] = '0';
  /* Filter criterion: Climate raw data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_climate';
  $handler->display->display_options['filters']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator_id'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['label'] = 'Meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['identifier'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Climate raw data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_climate';
  $handler->display->display_options['filters']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['exposed'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator_id'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['label'] = 'Timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['identifier'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Climate raw data: Meter_type */
  $handler->display->display_options['filters']['meter_type']['id'] = 'meter_type';
  $handler->display->display_options['filters']['meter_type']['table'] = 'negawatt_climate';
  $handler->display->display_options['filters']['meter_type']['field'] = 'meter_type';
  $handler->display->display_options['filters']['meter_type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['meter_type']['expose']['operator_id'] = 'meter_type_op';
  $handler->display->display_options['filters']['meter_type']['expose']['label'] = 'meter_type';
  $handler->display->display_options['filters']['meter_type']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['meter_type']['expose']['operator'] = 'meter_type_op';
  $handler->display->display_options['filters']['meter_type']['expose']['identifier'] = 'meter_type';
  $handler->display->display_options['filters']['meter_type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['meter_type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/climate-raw-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Elect. Raw';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['climate_raw_overview'] = $view;

  return $export;
}
