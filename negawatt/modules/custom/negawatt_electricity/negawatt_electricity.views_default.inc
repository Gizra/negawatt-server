<?php
/**
 * @file
 * negawatt_electricity.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_electricity_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'electricity_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_electricity_normalized';
  $view->human_name = 'Electricity overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Electricity overview';
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
    'type' => 'type',
    'timestamp' => 'timestamp',
    'rate_type' => 'rate_type',
    'meter_nid' => 'meter_nid',
    'sum_kwh' => 'sum_kwh',
    'avg_power' => 'avg_power',
    'min_power_factor' => 'min_power_factor',
  );
  $handler->display->display_options['style_options']['default'] = 'type';
  $handler->display->display_options['style_options']['info'] = array(
    'id' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'type' => array(
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
    'rate_type' => array(
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
    'sum_kwh' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'avg_power' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'min_power_factor' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Electricity data: Electricity data ID */
  $handler->display->display_options['fields']['id']['id'] = 'id';
  $handler->display->display_options['fields']['id']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['id']['field'] = 'id';
  $handler->display->display_options['fields']['id']['label'] = 'ID';
  $handler->display->display_options['fields']['id']['separator'] = '';
  /* Field: Electricity data: Type */
  $handler->display->display_options['fields']['type']['id'] = 'type';
  $handler->display->display_options['fields']['type']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['type']['field'] = 'type';
  /* Field: Electricity data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Electricity data: Rate_type */
  $handler->display->display_options['fields']['rate_type']['id'] = 'rate_type';
  $handler->display->display_options['fields']['rate_type']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['rate_type']['field'] = 'rate_type';
  /* Field: Electricity data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  /* Field: Electricity data: Sum_kwh */
  $handler->display->display_options['fields']['sum_kwh']['id'] = 'sum_kwh';
  $handler->display->display_options['fields']['sum_kwh']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['sum_kwh']['field'] = 'sum_kwh';
  $handler->display->display_options['fields']['sum_kwh']['precision'] = '0';
  /* Field: Electricity data: Avg_power */
  $handler->display->display_options['fields']['avg_power']['id'] = 'avg_power';
  $handler->display->display_options['fields']['avg_power']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['avg_power']['field'] = 'avg_power';
  /* Field: Electricity data: Min_power_factor */
  $handler->display->display_options['fields']['min_power_factor']['id'] = 'min_power_factor';
  $handler->display->display_options['fields']['min_power_factor']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['fields']['min_power_factor']['field'] = 'min_power_factor';
  $handler->display->display_options['fields']['min_power_factor']['precision'] = '0';
  /* Filter criterion: Electricity data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_electricity_normalized';
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
  /* Filter criterion: Electricity data: Rate_type */
  $handler->display->display_options['filters']['rate_type']['id'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['filters']['rate_type']['field'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['rate_type']['expose']['operator_id'] = 'rate_type_op';
  $handler->display->display_options['filters']['rate_type']['expose']['label'] = 'Rate_type';
  $handler->display->display_options['filters']['rate_type']['expose']['operator'] = 'rate_type_op';
  $handler->display->display_options['filters']['rate_type']['expose']['identifier'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['rate_type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Electricity data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_electricity_normalized';
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
  /* Filter criterion: Electricity data: Type */
  $handler->display->display_options['filters']['type']['id'] = 'type';
  $handler->display->display_options['filters']['type']['table'] = 'negawatt_electricity_normalized';
  $handler->display->display_options['filters']['type']['field'] = 'type';
  $handler->display->display_options['filters']['type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['operator_id'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['label'] = 'Type';
  $handler->display->display_options['filters']['type']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['operator'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['identifier'] = 'type';
  $handler->display->display_options['filters']['type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/electricity-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Electricity';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['electricity_overview'] = $view;

  $view = new view();
  $view->name = 'electricity_raw_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_electricity';
  $view->human_name = 'Electricity Raw overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Electricity Raw overview';
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
    'type' => 'type',
    'timestamp' => 'timestamp',
    'rate_type' => 'rate_type',
    'meter_nid' => 'meter_nid',
    'kwh' => 'kwh',
    'power_factor' => 'power_factor',
    'kwh_l1' => 'kwh_l1',
    'kwh_l2' => 'kwh_l2',
    'kwh_l3' => 'kwh_l3',
    'power_factor_l1' => 'power_factor_l1',
    'power_factor_l2' => 'power_factor_l2',
    'power_factor_l3' => 'power_factor_l3',
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
    'type' => array(
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
    'rate_type' => array(
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
    'kwh' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'power_factor' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'kwh_l1' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'kwh_l2' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'kwh_l3' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'power_factor_l1' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'power_factor_l2' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'power_factor_l3' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Electricity raw data: Electricity raw data ID */
  $handler->display->display_options['fields']['id_1']['id'] = 'id_1';
  $handler->display->display_options['fields']['id_1']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['id_1']['field'] = 'id';
  $handler->display->display_options['fields']['id_1']['label'] = 'ID';
  $handler->display->display_options['fields']['id_1']['separator'] = '';
  /* Field: Electricity raw data: Type */
  $handler->display->display_options['fields']['type']['id'] = 'type';
  $handler->display->display_options['fields']['type']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['type']['field'] = 'type';
  /* Field: Electricity raw data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Electricity raw data: Rate_type */
  $handler->display->display_options['fields']['rate_type']['id'] = 'rate_type';
  $handler->display->display_options['fields']['rate_type']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['rate_type']['field'] = 'rate_type';
  /* Field: Electricity raw data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['separator'] = '';
  /* Field: Electricity raw data: Kwh */
  $handler->display->display_options['fields']['kwh']['id'] = 'kwh';
  $handler->display->display_options['fields']['kwh']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['kwh']['field'] = 'kwh';
  $handler->display->display_options['fields']['kwh']['label'] = 'kwh';
  /* Field: Electricity raw data: Power_factor */
  $handler->display->display_options['fields']['power_factor']['id'] = 'power_factor';
  $handler->display->display_options['fields']['power_factor']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['power_factor']['field'] = 'power_factor';
  $handler->display->display_options['fields']['power_factor']['precision'] = '0';
  /* Field: Electricity raw data: Kwh_l1 */
  $handler->display->display_options['fields']['kwh_l1']['id'] = 'kwh_l1';
  $handler->display->display_options['fields']['kwh_l1']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['kwh_l1']['field'] = 'kwh_l1';
  $handler->display->display_options['fields']['kwh_l1']['label'] = 'kwh_l1';
  /* Field: Electricity raw data: Kwh_l2 */
  $handler->display->display_options['fields']['kwh_l2']['id'] = 'kwh_l2';
  $handler->display->display_options['fields']['kwh_l2']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['kwh_l2']['field'] = 'kwh_l2';
  $handler->display->display_options['fields']['kwh_l2']['label'] = 'kwh_l2';
  /* Field: Electricity raw data: Kwh_l3 */
  $handler->display->display_options['fields']['kwh_l3']['id'] = 'kwh_l3';
  $handler->display->display_options['fields']['kwh_l3']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['kwh_l3']['field'] = 'kwh_l3';
  $handler->display->display_options['fields']['kwh_l3']['label'] = 'kwh_l3';
  /* Field: Electricity raw data: Power_factor_l1 */
  $handler->display->display_options['fields']['power_factor_l1']['id'] = 'power_factor_l1';
  $handler->display->display_options['fields']['power_factor_l1']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['power_factor_l1']['field'] = 'power_factor_l1';
  $handler->display->display_options['fields']['power_factor_l1']['label'] = 'PF l1';
  $handler->display->display_options['fields']['power_factor_l1']['precision'] = '0';
  /* Field: Electricity raw data: Power_factor_l2 */
  $handler->display->display_options['fields']['power_factor_l2']['id'] = 'power_factor_l2';
  $handler->display->display_options['fields']['power_factor_l2']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['power_factor_l2']['field'] = 'power_factor_l2';
  $handler->display->display_options['fields']['power_factor_l2']['label'] = 'PF l2';
  $handler->display->display_options['fields']['power_factor_l2']['precision'] = '0';
  /* Field: Electricity raw data: Power_factor_l3 */
  $handler->display->display_options['fields']['power_factor_l3']['id'] = 'power_factor_l3';
  $handler->display->display_options['fields']['power_factor_l3']['table'] = 'negawatt_electricity';
  $handler->display->display_options['fields']['power_factor_l3']['field'] = 'power_factor_l3';
  $handler->display->display_options['fields']['power_factor_l3']['label'] = 'PF l3';
  $handler->display->display_options['fields']['power_factor_l3']['precision'] = '0';
  /* Filter criterion: Electricity raw data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_electricity';
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
  /* Filter criterion: Electricity raw data: Rate_type */
  $handler->display->display_options['filters']['rate_type']['id'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['table'] = 'negawatt_electricity';
  $handler->display->display_options['filters']['rate_type']['field'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['rate_type']['expose']['operator_id'] = 'rate_type_op';
  $handler->display->display_options['filters']['rate_type']['expose']['label'] = 'Rate_type';
  $handler->display->display_options['filters']['rate_type']['expose']['operator'] = 'rate_type_op';
  $handler->display->display_options['filters']['rate_type']['expose']['identifier'] = 'rate_type';
  $handler->display->display_options['filters']['rate_type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['rate_type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Electricity raw data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_electricity';
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
  /* Filter criterion: Electricity raw data: Type */
  $handler->display->display_options['filters']['type']['id'] = 'type';
  $handler->display->display_options['filters']['type']['table'] = 'negawatt_electricity';
  $handler->display->display_options['filters']['type']['field'] = 'type';
  $handler->display->display_options['filters']['type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['operator_id'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['label'] = 'Type';
  $handler->display->display_options['filters']['type']['expose']['use_operator'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['operator'] = 'type_op';
  $handler->display->display_options['filters']['type']['expose']['identifier'] = 'type';
  $handler->display->display_options['filters']['type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/electricity-raw-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Elect. Raw';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['electricity_raw_overview'] = $view;

  return $export;
}
