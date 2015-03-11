<?php
/**
 * @file
 * negawatt_meter.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_meter_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'meters';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'node';
  $view->human_name = 'Meters';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Meters';
  $handler->display->display_options['use_more_always'] = FALSE;
  $handler->display->display_options['access']['type'] = 'perm';
  $handler->display->display_options['cache']['type'] = 'none';
  $handler->display->display_options['query']['type'] = 'views_query';
  $handler->display->display_options['exposed_form']['type'] = 'basic';
  $handler->display->display_options['exposed_form']['options']['autosubmit'] = TRUE;
  $handler->display->display_options['pager']['type'] = 'full';
  $handler->display->display_options['pager']['options']['items_per_page'] = '50';
  $handler->display->display_options['style_plugin'] = 'views_aggregator';
  $handler->display->display_options['style_options']['columns'] = array(
    'title' => 'title',
    'type' => 'type',
    'field_place_address' => 'field_place_address',
    'field_place_description' => 'field_place_description',
    'term_node_tid' => 'term_node_tid',
    'field_max_frequency' => 'field_max_frequency',
    'field_last_processed' => 'field_last_processed',
    'field_category_valid' => 'field_category_valid',
    'field_location_valid' => 'field_location_valid',
    'delete_node' => 'delete_node',
    'edit_node' => 'edit_node',
  );
  $handler->display->display_options['style_options']['default'] = '-1';
  $handler->display->display_options['style_options']['info'] = array(
    'title' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_average',
      'aggr_par_column' => '',
    ),
    'type' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_enumerate' => 'views_aggregator_enumerate',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'field_place_address' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'field_place_description' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'term_node_tid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'field_max_frequency' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'field_last_processed' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 1,
      'aggr_column' => 'views_aggregator_count',
      'aggr_par_column' => '',
    ),
    'field_category_valid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 1,
      'aggr_column' => 'views_aggregator_count',
      'aggr_par_column' => '1',
    ),
    'field_location_valid' => array(
      'sortable' => 1,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_count' => 'views_aggregator_count',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 1,
      'aggr_column' => 'views_aggregator_count',
      'aggr_par_column' => '1',
    ),
    'delete_node' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
    'edit_node' => array(
      'sortable' => 0,
      'default_sort_order' => 'asc',
      'align' => '',
      'separator' => '',
      'empty_column' => 0,
      'has_aggr' => 0,
      'aggr' => array(
        'views_aggregator_first' => 'views_aggregator_first',
      ),
      'aggr_par' => '',
      'has_aggr_column' => 0,
      'aggr_column' => 'views_aggregator_sum',
      'aggr_par_column' => '',
    ),
  );
  $handler->display->display_options['style_options']['column_aggregation']['totals_per_page'] = '0';
  $handler->display->display_options['style_options']['column_aggregation']['totals_row_position'] = array(
    1 => 0,
    2 => '2',
  );
  $handler->display->display_options['style_options']['column_aggregation']['precision'] = '2';
  /* Field: Content: Title */
  $handler->display->display_options['fields']['title']['id'] = 'title';
  $handler->display->display_options['fields']['title']['table'] = 'node';
  $handler->display->display_options['fields']['title']['field'] = 'title';
  $handler->display->display_options['fields']['title']['alter']['word_boundary'] = FALSE;
  $handler->display->display_options['fields']['title']['alter']['ellipsis'] = FALSE;
  /* Field: Content: Type */
  $handler->display->display_options['fields']['type']['id'] = 'type';
  $handler->display->display_options['fields']['type']['table'] = 'node';
  $handler->display->display_options['fields']['type']['field'] = 'type';
  /* Field: Content: Place Address */
  $handler->display->display_options['fields']['field_place_address']['id'] = 'field_place_address';
  $handler->display->display_options['fields']['field_place_address']['table'] = 'field_data_field_place_address';
  $handler->display->display_options['fields']['field_place_address']['field'] = 'field_place_address';
  /* Field: Content: Place Description */
  $handler->display->display_options['fields']['field_place_description']['id'] = 'field_place_description';
  $handler->display->display_options['fields']['field_place_description']['table'] = 'field_data_field_place_description';
  $handler->display->display_options['fields']['field_place_description']['field'] = 'field_place_description';
  /* Field: Content: All taxonomy terms */
  $handler->display->display_options['fields']['term_node_tid']['id'] = 'term_node_tid';
  $handler->display->display_options['fields']['term_node_tid']['table'] = 'node';
  $handler->display->display_options['fields']['term_node_tid']['field'] = 'term_node_tid';
  $handler->display->display_options['fields']['term_node_tid']['label'] = 'Category';
  $handler->display->display_options['fields']['term_node_tid']['vocabularies'] = array(
    'meter_category_account1' => 0,
    'meter_category_account2' => 0,
    'meter_category_account3' => 0,
    'meter_category' => 0,
  );
  /* Field: Content: Max frequency */
  $handler->display->display_options['fields']['field_max_frequency']['id'] = 'field_max_frequency';
  $handler->display->display_options['fields']['field_max_frequency']['table'] = 'field_data_field_max_frequency';
  $handler->display->display_options['fields']['field_max_frequency']['field'] = 'field_max_frequency';
  /* Field: Content: Last processed */
  $handler->display->display_options['fields']['field_last_processed']['id'] = 'field_last_processed';
  $handler->display->display_options['fields']['field_last_processed']['table'] = 'field_data_field_last_processed';
  $handler->display->display_options['fields']['field_last_processed']['field'] = 'field_last_processed';
  $handler->display->display_options['fields']['field_last_processed']['settings'] = array(
    'format_type' => 'short',
    'fromto' => 'both',
    'multiple_number' => '',
    'multiple_from' => '',
    'multiple_to' => '',
  );
  /* Field: Content: Category valid */
  $handler->display->display_options['fields']['field_category_valid']['id'] = 'field_category_valid';
  $handler->display->display_options['fields']['field_category_valid']['table'] = 'field_data_field_category_valid';
  $handler->display->display_options['fields']['field_category_valid']['field'] = 'field_category_valid';
  /* Field: Content: Location valid */
  $handler->display->display_options['fields']['field_location_valid']['id'] = 'field_location_valid';
  $handler->display->display_options['fields']['field_location_valid']['table'] = 'field_data_field_location_valid';
  $handler->display->display_options['fields']['field_location_valid']['field'] = 'field_location_valid';
  /* Field: Content: Delete link */
  $handler->display->display_options['fields']['delete_node']['id'] = 'delete_node';
  $handler->display->display_options['fields']['delete_node']['table'] = 'views_entity_node';
  $handler->display->display_options['fields']['delete_node']['field'] = 'delete_node';
  /* Field: Content: Edit link */
  $handler->display->display_options['fields']['edit_node']['id'] = 'edit_node';
  $handler->display->display_options['fields']['edit_node']['table'] = 'views_entity_node';
  $handler->display->display_options['fields']['edit_node']['field'] = 'edit_node';
  /* Sort criterion: Content: Post date */
  $handler->display->display_options['sorts']['created']['id'] = 'created';
  $handler->display->display_options['sorts']['created']['table'] = 'node';
  $handler->display->display_options['sorts']['created']['field'] = 'created';
  $handler->display->display_options['sorts']['created']['order'] = 'DESC';
  /* Filter criterion: Content: Title */
  $handler->display->display_options['filters']['title']['id'] = 'title';
  $handler->display->display_options['filters']['title']['table'] = 'node';
  $handler->display->display_options['filters']['title']['field'] = 'title';
  $handler->display->display_options['filters']['title']['operator'] = 'contains';
  $handler->display->display_options['filters']['title']['group'] = 1;
  $handler->display->display_options['filters']['title']['exposed'] = TRUE;
  $handler->display->display_options['filters']['title']['expose']['operator_id'] = 'title_op';
  $handler->display->display_options['filters']['title']['expose']['label'] = 'Title';
  $handler->display->display_options['filters']['title']['expose']['operator'] = 'title_op';
  $handler->display->display_options['filters']['title']['expose']['identifier'] = 'title';
  $handler->display->display_options['filters']['title']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['title']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Content: Published */
  $handler->display->display_options['filters']['status']['id'] = 'status';
  $handler->display->display_options['filters']['status']['table'] = 'node';
  $handler->display->display_options['filters']['status']['field'] = 'status';
  $handler->display->display_options['filters']['status']['value'] = 1;
  $handler->display->display_options['filters']['status']['group'] = 1;
  $handler->display->display_options['filters']['status']['expose']['operator'] = FALSE;
  /* Filter criterion: Content: Place Address (field_place_address) */
  $handler->display->display_options['filters']['field_place_address_value']['id'] = 'field_place_address_value';
  $handler->display->display_options['filters']['field_place_address_value']['table'] = 'field_data_field_place_address';
  $handler->display->display_options['filters']['field_place_address_value']['field'] = 'field_place_address_value';
  $handler->display->display_options['filters']['field_place_address_value']['group'] = 1;
  $handler->display->display_options['filters']['field_place_address_value']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_place_address_value']['expose']['operator_id'] = 'field_place_address_value_op';
  $handler->display->display_options['filters']['field_place_address_value']['expose']['label'] = 'Place Address';
  $handler->display->display_options['filters']['field_place_address_value']['expose']['operator'] = 'field_place_address_value_op';
  $handler->display->display_options['filters']['field_place_address_value']['expose']['identifier'] = 'field_place_address_value';
  $handler->display->display_options['filters']['field_place_address_value']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['field_place_address_value']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Content: Type */
  $handler->display->display_options['filters']['type']['id'] = 'type';
  $handler->display->display_options['filters']['type']['table'] = 'node';
  $handler->display->display_options['filters']['type']['field'] = 'type';
  $handler->display->display_options['filters']['type']['value'] = array(
    'iec_meter' => 'iec_meter',
    'satec_meter' => 'satec_meter',
  );
  $handler->display->display_options['filters']['type']['group'] = 1;
  /* Filter criterion: Content: Place Description (field_place_description) */
  $handler->display->display_options['filters']['field_place_description_value']['id'] = 'field_place_description_value';
  $handler->display->display_options['filters']['field_place_description_value']['table'] = 'field_data_field_place_description';
  $handler->display->display_options['filters']['field_place_description_value']['field'] = 'field_place_description_value';
  $handler->display->display_options['filters']['field_place_description_value']['group'] = 1;
  $handler->display->display_options['filters']['field_place_description_value']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_place_description_value']['expose']['operator_id'] = 'field_place_description_value_op';
  $handler->display->display_options['filters']['field_place_description_value']['expose']['label'] = 'Place Description';
  $handler->display->display_options['filters']['field_place_description_value']['expose']['operator'] = 'field_place_description_value_op';
  $handler->display->display_options['filters']['field_place_description_value']['expose']['identifier'] = 'field_place_description_value';
  $handler->display->display_options['filters']['field_place_description_value']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['field_place_description_value']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  /* Filter criterion: Content: Type */
  $handler->display->display_options['filters']['type_1']['id'] = 'type_1';
  $handler->display->display_options['filters']['type_1']['table'] = 'node';
  $handler->display->display_options['filters']['type_1']['field'] = 'type';
  $handler->display->display_options['filters']['type_1']['value'] = array(
    'iec_meter' => 'iec_meter',
    'satec_meter' => 'satec_meter',
  );
  $handler->display->display_options['filters']['type_1']['group'] = 1;
  $handler->display->display_options['filters']['type_1']['exposed'] = TRUE;
  $handler->display->display_options['filters']['type_1']['expose']['operator_id'] = 'type_1_op';
  $handler->display->display_options['filters']['type_1']['expose']['label'] = 'Type';
  $handler->display->display_options['filters']['type_1']['expose']['operator'] = 'type_1_op';
  $handler->display->display_options['filters']['type_1']['expose']['identifier'] = 'type_1';
  $handler->display->display_options['filters']['type_1']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['type_1']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['type_1']['is_grouped'] = TRUE;
  $handler->display->display_options['filters']['type_1']['group_info']['label'] = 'Type';
  $handler->display->display_options['filters']['type_1']['group_info']['identifier'] = 'type_1';
  $handler->display->display_options['filters']['type_1']['group_info']['remember'] = 1;
  $handler->display->display_options['filters']['type_1']['group_info']['group_items'] = array(
    1 => array(
      'title' => 'IEC Meter',
      'operator' => 'in',
      'value' => array(
        'iec_meter' => 'iec_meter',
        'all' => 0,
        'account' => 0,
        'satec_meter' => 0,
      ),
    ),
    2 => array(
      'title' => 'SATEC Meter',
      'operator' => 'in',
      'value' => array(
        'satec_meter' => 'satec_meter',
        'all' => 0,
        'account' => 0,
        'iec_meter' => 0,
      ),
    ),
  );
  /* Filter criterion: Content: Max frequency (field_max_frequency) */
  $handler->display->display_options['filters']['field_max_frequency_value']['id'] = 'field_max_frequency_value';
  $handler->display->display_options['filters']['field_max_frequency_value']['table'] = 'field_data_field_max_frequency';
  $handler->display->display_options['filters']['field_max_frequency_value']['field'] = 'field_max_frequency_value';
  $handler->display->display_options['filters']['field_max_frequency_value']['group'] = 1;
  $handler->display->display_options['filters']['field_max_frequency_value']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_max_frequency_value']['expose']['operator_id'] = 'field_max_frequency_value_op';
  $handler->display->display_options['filters']['field_max_frequency_value']['expose']['label'] = 'Max frequency (field_max_frequency)';
  $handler->display->display_options['filters']['field_max_frequency_value']['expose']['operator'] = 'field_max_frequency_value_op';
  $handler->display->display_options['filters']['field_max_frequency_value']['expose']['identifier'] = 'field_max_frequency_value';
  $handler->display->display_options['filters']['field_max_frequency_value']['is_grouped'] = TRUE;
  $handler->display->display_options['filters']['field_max_frequency_value']['group_info']['label'] = 'Max frequency';
  $handler->display->display_options['filters']['field_max_frequency_value']['group_info']['identifier'] = 'field_max_frequency_value';
  $handler->display->display_options['filters']['field_max_frequency_value']['group_info']['remember'] = 1;
  $handler->display->display_options['filters']['field_max_frequency_value']['group_info']['group_items'] = array(
    1 => array(
      'title' => 'Month',
      'operator' => 'or',
      'value' => array(
        2 => '2',
      ),
    ),
    2 => array(
      'title' => 'Day',
      'operator' => 'or',
      'value' => array(
        3 => '3',
      ),
    ),
    3 => array(
      'title' => 'Hour',
      'operator' => 'or',
      'value' => array(
        4 => '4',
      ),
    ),
    4 => array(
      'title' => 'Minute',
      'operator' => 'or',
      'value' => array(
        5 => '5',
      ),
    ),
  );
  /* Filter criterion: Content: Category valid (field_category_valid) */
  $handler->display->display_options['filters']['field_category_valid_value']['id'] = 'field_category_valid_value';
  $handler->display->display_options['filters']['field_category_valid_value']['table'] = 'field_data_field_category_valid';
  $handler->display->display_options['filters']['field_category_valid_value']['field'] = 'field_category_valid_value';
  $handler->display->display_options['filters']['field_category_valid_value']['value'] = array(
    0 => '0',
    1 => '1',
  );
  $handler->display->display_options['filters']['field_category_valid_value']['group'] = 1;
  $handler->display->display_options['filters']['field_category_valid_value']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['operator_id'] = 'field_category_valid_value_op';
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['label'] = 'Category valid';
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['operator'] = 'field_category_valid_value_op';
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['identifier'] = 'field_category_valid_value';
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['field_category_valid_value']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['field_category_valid_value']['is_grouped'] = TRUE;
  $handler->display->display_options['filters']['field_category_valid_value']['group_info']['label'] = 'Category valid';
  $handler->display->display_options['filters']['field_category_valid_value']['group_info']['identifier'] = 'field_category_valid_value';
  $handler->display->display_options['filters']['field_category_valid_value']['group_info']['remember'] = 1;
  $handler->display->display_options['filters']['field_category_valid_value']['group_info']['group_items'] = array(
    1 => array(
      'title' => 'Yes',
      'operator' => 'or',
      'value' => array(
        1 => '1',
      ),
    ),
    2 => array(
      'title' => 'No',
      'operator' => 'or',
      'value' => array(
        0 => '0',
      ),
    ),
  );
  /* Filter criterion: Content: Location valid (field_location_valid) */
  $handler->display->display_options['filters']['field_location_valid_value']['id'] = 'field_location_valid_value';
  $handler->display->display_options['filters']['field_location_valid_value']['table'] = 'field_data_field_location_valid';
  $handler->display->display_options['filters']['field_location_valid_value']['field'] = 'field_location_valid_value';
  $handler->display->display_options['filters']['field_location_valid_value']['value'] = array(
    0 => '0',
    1 => '1',
  );
  $handler->display->display_options['filters']['field_location_valid_value']['group'] = 1;
  $handler->display->display_options['filters']['field_location_valid_value']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['operator_id'] = 'field_location_valid_value_op';
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['label'] = 'Location valid';
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['operator'] = 'field_location_valid_value_op';
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['identifier'] = 'field_location_valid_value';
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['remember'] = TRUE;
  $handler->display->display_options['filters']['field_location_valid_value']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['field_location_valid_value']['is_grouped'] = TRUE;
  $handler->display->display_options['filters']['field_location_valid_value']['group_info']['label'] = 'Location valid';
  $handler->display->display_options['filters']['field_location_valid_value']['group_info']['identifier'] = 'field_location_valid_value';
  $handler->display->display_options['filters']['field_location_valid_value']['group_info']['remember'] = 1;
  $handler->display->display_options['filters']['field_location_valid_value']['group_info']['group_items'] = array(
    1 => array(
      'title' => 'Yes',
      'operator' => 'or',
      'value' => array(
        1 => '1',
      ),
    ),
    2 => array(
      'title' => 'No',
      'operator' => 'or',
      'value' => array(
        0 => '0',
      ),
    ),
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/meters';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Meters';
  $handler->display->display_options['menu']['weight'] = '-1';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['meters'] = $view;

  return $export;
}