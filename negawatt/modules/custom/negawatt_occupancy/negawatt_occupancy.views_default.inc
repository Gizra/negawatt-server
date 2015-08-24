<?php
/**
 * @file
 * negawatt_occupancy.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_occupancy_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'occupancy_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_occupancy_normalized';
  $view->human_name = 'Occupancy overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Occupancy Data';
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'none';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['exposed_form']['options']['autosubmit'] = TRUE;
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '25';
  $handler->display->display_options['style_plugin'] = 'table';
  $handler->display->display_options['style_options']['columns'] = array(
    'id' => 'id',
    'frequency' => 'frequency',
    'timestamp' => 'timestamp',
    'meter_nid' => 'meter_nid',
    'avg_occupancy' => 'avg_occupancy',
    'min_occupancy' => 'min_occupancy',
    'max_occupancy' => 'max_occupancy',
  );
  $handler->display->display_options['style_options']['default'] = 'meter_nid';
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
    'avg_occupancy' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'min_occupancy' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'max_occupancy' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Occupancy data: Occupancy data ID */
  $handler->display->display_options['fields']['id']['id'] = 'id';
  $handler->display->display_options['fields']['id']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['id']['field'] = 'id';
  $handler->display->display_options['fields']['id']['label'] = 'ID';
  $handler->display->display_options['fields']['id']['separator'] = '';
  /* Field: Occupancy data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  /* Field: Occupancy data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Occupancy data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Occupancy data: Avg_occupancy */
  $handler->display->display_options['fields']['avg_occupancy']['id'] = 'avg_occupancy';
  $handler->display->display_options['fields']['avg_occupancy']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['avg_occupancy']['field'] = 'avg_occupancy';
  $handler->display->display_options['fields']['avg_occupancy']['precision'] = '0';
  /* Field: Occupancy data: Max_occupancy */
  $handler->display->display_options['fields']['max_occupancy']['id'] = 'max_occupancy';
  $handler->display->display_options['fields']['max_occupancy']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['max_occupancy']['field'] = 'max_occupancy';
  $handler->display->display_options['fields']['max_occupancy']['precision'] = '0';
  /* Field: Occupancy data: Min_occupancy */
  $handler->display->display_options['fields']['min_occupancy']['id'] = 'min_occupancy';
  $handler->display->display_options['fields']['min_occupancy']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['fields']['min_occupancy']['field'] = 'min_occupancy';
  $handler->display->display_options['fields']['min_occupancy']['precision'] = '0';
  /* Filter criterion: Occupancy data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['filters']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator_id'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['label'] = 'Meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['operator'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['identifier'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Occupancy data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['filters']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['exposed'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator_id'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['label'] = 'Timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['operator'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['identifier'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Occupancy data: Frequency */
  $handler->display->display_options['filters']['frequency']['id'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['table'] = 'negawatt_occupancy_normalized';
  $handler->display->display_options['filters']['frequency']['field'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['exposed'] = TRUE;
  $handler->display->display_options['filters']['frequency']['expose']['operator_id'] = 'frequency_op';
  $handler->display->display_options['filters']['frequency']['expose']['label'] = 'frequency';
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
  $handler->display->display_options['path'] = 'admin/content/occupancy';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Occup.';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['occupancy_overview'] = $view;

  $view = new view();
  $view->name = 'occupancy_raw_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_occupancy';
  $view->human_name = 'Occupancy Raw overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Occupancy Raw';
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'none';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['exposed_form']['options']['autosubmit'] = TRUE;
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '25';
  $handler->display->display_options['style_plugin'] = 'table';
  $handler->display->display_options['style_options']['columns'] = array(
    'id_1' => 'id_1',
    'meter_nid' => 'meter_nid',
    'timestamp' => 'timestamp',
    'frequency' => 'frequency',
  );
  $handler->display->display_options['style_options']['default'] = 'meter_nid';
  $handler->display->display_options['style_options']['info'] = array(
    'id_1' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
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
    'timestamp' => array(
      'sortable' => 1,
      'default_sort_order' => 'desc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'frequency' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Occupancy raw data: Occupancy raw data ID */
  $handler->display->display_options['fields']['id_1']['id'] = 'id_1';
  $handler->display->display_options['fields']['id_1']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['id_1']['field'] = 'id';
  $handler->display->display_options['fields']['id_1']['label'] = 'ID';
  $handler->display->display_options['fields']['id_1']['separator'] = '';
  /* Field: Occupancy raw data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['separator'] = '';
  /* Field: Occupancy raw data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Occupancy raw data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Occupancy raw data: Occupancy_abs */
  $handler->display->display_options['fields']['occupancy_abs']['id'] = 'occupancy_abs';
  $handler->display->display_options['fields']['occupancy_abs']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['occupancy_abs']['field'] = 'occupancy_abs';
  $handler->display->display_options['fields']['occupancy_abs']['precision'] = '0';
  /* Field: Occupancy raw data: Occupancy_rel */
  $handler->display->display_options['fields']['occupancy_rel']['id'] = 'occupancy_rel';
  $handler->display->display_options['fields']['occupancy_rel']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['occupancy_rel']['field'] = 'occupancy_rel';
  $handler->display->display_options['fields']['occupancy_rel']['precision'] = '0';
  /* Field: Occupancy raw data: Guests */
  $handler->display->display_options['fields']['guests']['id'] = 'guests';
  $handler->display->display_options['fields']['guests']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['fields']['guests']['field'] = 'guests';
  $handler->display->display_options['fields']['guests']['precision'] = '0';
  /* Filter criterion: Occupancy raw data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['filters']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['exposed'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['operator_id'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['label'] = 'Meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['operator'] = 'meter_nid_op';
  $handler->display->display_options['filters']['meter_nid']['expose']['identifier'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['meter_nid']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Occupancy raw data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['filters']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['exposed'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['operator_id'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['label'] = 'Timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['operator'] = 'timestamp_op';
  $handler->display->display_options['filters']['timestamp']['expose']['identifier'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['timestamp']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Occupancy raw data: Frequency */
  $handler->display->display_options['filters']['frequency']['id'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['table'] = 'negawatt_occupancy';
  $handler->display->display_options['filters']['frequency']['field'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['exposed'] = TRUE;
  $handler->display->display_options['filters']['frequency']['expose']['operator_id'] = 'frequency_op';
  $handler->display->display_options['filters']['frequency']['expose']['label'] = 'Frequency';
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
  $handler->display->display_options['path'] = 'admin/content/occupancy-raw';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Occup. Raw';
  $handler->display->display_options['menu']['description'] = 'Raw occupancy data';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['occupancy_raw_overview'] = $view;

  return $export;
}
