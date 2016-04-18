<?php
/**
 * @file
 * negawatt_payment.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_payment_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'payment_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_payment_normalized';
  $view->human_name = 'Payment overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Payment overview';
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
    'payment_type' => 'payment_type',
    'meter_nid' => 'meter_nid',
    'sum_amount' => 'sum_amount',
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
    'payment_type' => array(
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
    'sum_amount' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Payment data: Payment data ID */
  $handler->display->display_options['fields']['id']['id'] = 'id';
  $handler->display->display_options['fields']['id']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['id']['field'] = 'id';
  $handler->display->display_options['fields']['id']['label'] = 'ID';
  $handler->display->display_options['fields']['id']['separator'] = '';
  /* Field: Payment data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Payment data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Payment data: Payment_type */
  $handler->display->display_options['fields']['payment_type']['id'] = 'payment_type';
  $handler->display->display_options['fields']['payment_type']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['payment_type']['field'] = 'payment_type';
  /* Field: Payment data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  /* Field: Payment data: Sum_amount */
  $handler->display->display_options['fields']['sum_amount']['id'] = 'sum_amount';
  $handler->display->display_options['fields']['sum_amount']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['fields']['sum_amount']['field'] = 'sum_amount';
  $handler->display->display_options['fields']['sum_amount']['precision'] = '0';
  /* Filter criterion: Payment data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_payment_normalized';
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
  /* Filter criterion: Payment data: Payment_type */
  $handler->display->display_options['filters']['payment_type']['id'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['table'] = 'negawatt_payment_normalized';
  $handler->display->display_options['filters']['payment_type']['field'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['payment_type']['expose']['operator_id'] = 'payment_type_op';
  $handler->display->display_options['filters']['payment_type']['expose']['label'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['expose']['operator'] = 'payment_type_op';
  $handler->display->display_options['filters']['payment_type']['expose']['identifier'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['payment_type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Payment data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_payment_normalized';
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
  /* Filter criterion: Payment data: Frequency */
  $handler->display->display_options['filters']['frequency']['id'] = 'frequency';
  $handler->display->display_options['filters']['frequency']['table'] = 'negawatt_payment_normalized';
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
  $handler->display->display_options['path'] = 'admin/content/payment-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Payment';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['payment_overview'] = $view;

  $view = new view();
  $view->name = 'payment_raw_overview';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'negawatt_payment';
  $view->human_name = 'Payment Raw overview';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Payment Raw overview';
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
    'timestamp' => 'timestamp',
    'payment_type' => 'payment_type',
    'frequency' => 'frequency',
    'meter_nid' => 'meter_nid',
    'amount' => 'amount',
  );
  $handler->display->display_options['style_options']['default'] = 'frequency';
  $handler->display->display_options['style_options']['info'] = array(
    'id_1' => array(
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
    'payment_type' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
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
    'meter_nid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
    'amount' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
    ),
  );
  /* Field: Payment raw data: Payment raw data ID */
  $handler->display->display_options['fields']['id_1']['id'] = 'id_1';
  $handler->display->display_options['fields']['id_1']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['id_1']['field'] = 'id';
  $handler->display->display_options['fields']['id_1']['label'] = 'ID';
  $handler->display->display_options['fields']['id_1']['separator'] = '';
  /* Field: Payment raw data: Timestamp */
  $handler->display->display_options['fields']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['fields']['timestamp']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['timestamp']['field'] = 'timestamp';
  /* Field: Payment raw data: Payment_type */
  $handler->display->display_options['fields']['payment_type']['id'] = 'payment_type';
  $handler->display->display_options['fields']['payment_type']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['payment_type']['field'] = 'payment_type';
  /* Field: Payment raw data: Frequency */
  $handler->display->display_options['fields']['frequency']['id'] = 'frequency';
  $handler->display->display_options['fields']['frequency']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['frequency']['field'] = 'frequency';
  /* Field: Payment raw data: Meter_nid */
  $handler->display->display_options['fields']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['fields']['meter_nid']['alter']['alter_text'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['text'] = 'Node [meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['alter']['make_link'] = TRUE;
  $handler->display->display_options['fields']['meter_nid']['alter']['path'] = 'node/[meter_nid]';
  $handler->display->display_options['fields']['meter_nid']['separator'] = '';
  /* Field: Payment raw data: Amount */
  $handler->display->display_options['fields']['amount']['id'] = 'amount';
  $handler->display->display_options['fields']['amount']['table'] = 'negawatt_payment';
  $handler->display->display_options['fields']['amount']['field'] = 'amount';
  $handler->display->display_options['fields']['amount']['label'] = 'amount';
  /* Filter criterion: Payment raw data: Meter_nid */
  $handler->display->display_options['filters']['meter_nid']['id'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['table'] = 'negawatt_payment';
  $handler->display->display_options['filters']['meter_nid']['field'] = 'meter_nid';
  $handler->display->display_options['filters']['meter_nid']['group'] = 1;
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
  /* Filter criterion: Payment raw data: Payment_type */
  $handler->display->display_options['filters']['payment_type']['id'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['table'] = 'negawatt_payment';
  $handler->display->display_options['filters']['payment_type']['field'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['group'] = 1;
  $handler->display->display_options['filters']['payment_type']['exposed'] = TRUE;
  $handler->display->display_options['filters']['payment_type']['expose']['operator_id'] = 'payment_type_op';
  $handler->display->display_options['filters']['payment_type']['expose']['label'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['expose']['operator'] = 'payment_type_op';
  $handler->display->display_options['filters']['payment_type']['expose']['identifier'] = 'payment_type';
  $handler->display->display_options['filters']['payment_type']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['payment_type']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Payment raw data: Timestamp */
  $handler->display->display_options['filters']['timestamp']['id'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['table'] = 'negawatt_payment';
  $handler->display->display_options['filters']['timestamp']['field'] = 'timestamp';
  $handler->display->display_options['filters']['timestamp']['group'] = 1;
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

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/payment-raw-overview';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Payment Raw';
  $handler->display->display_options['menu']['weight'] = '0';
  $handler->display->display_options['menu']['name'] = 'devel';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['payment_raw_overview'] = $view;

  return $export;
}
