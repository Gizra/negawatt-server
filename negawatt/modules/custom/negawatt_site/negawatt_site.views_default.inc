<?php
/**
 * @file
 * negawatt_site.views_default.inc
 */

/**
 * Implements hook_views_default_views().
 */
function negawatt_site_views_default_views() {
  $export = array();

  $view = new view();
  $view->name = 'sites';
  $view->description = '';
  $view->tag = 'default';
  $view->base_table = 'node';
  $view->human_name = 'Sites';
  $view->core = 7;
  $view->api_version = '3.0';
  $view->disabled = FALSE; /* Edit this to true to make a default view disabled initially */

  /* Display: Master */
  $handler = $view->new_display('default', 'Master', 'default');
  $handler->display->display_options['title'] = 'Sites';
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
    'og_group_ref' => 'og_group_ref',
    'field_place_address' => 'field_place_address',
    'field_place_description' => 'field_place_description',
    'term_node_tid' => 'term_node_tid',
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
      'has_aggr_column' => 1,
      'aggr_column' => 'views_aggregator_count',
      'aggr_par_column' => '',
    ),
    'og_group_ref' => array(
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
  /* Field: Content: Groups audience */
  $handler->display->display_options['fields']['og_group_ref']['id'] = 'og_group_ref';
  $handler->display->display_options['fields']['og_group_ref']['table'] = 'og_membership';
  $handler->display->display_options['fields']['og_group_ref']['field'] = 'og_group_ref';
  $handler->display->display_options['fields']['og_group_ref']['label'] = 'Account';
  $handler->display->display_options['fields']['og_group_ref']['settings'] = array(
    'link' => 1,
  );
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
  /* Filter criterion: Content: Groups audience (og_group_ref) */
  $handler->display->display_options['filters']['og_group_ref_target_id']['id'] = 'og_group_ref_target_id';
  $handler->display->display_options['filters']['og_group_ref_target_id']['table'] = 'og_membership';
  $handler->display->display_options['filters']['og_group_ref_target_id']['field'] = 'og_group_ref_target_id';
  $handler->display->display_options['filters']['og_group_ref_target_id']['group'] = 1;
  $handler->display->display_options['filters']['og_group_ref_target_id']['exposed'] = TRUE;
  $handler->display->display_options['filters']['og_group_ref_target_id']['expose']['operator_id'] = 'og_group_ref_target_id_op';
  $handler->display->display_options['filters']['og_group_ref_target_id']['expose']['label'] = 'Account';
  $handler->display->display_options['filters']['og_group_ref_target_id']['expose']['operator'] = 'og_group_ref_target_id_op';
  $handler->display->display_options['filters']['og_group_ref_target_id']['expose']['identifier'] = 'og_group_ref_target_id';
  $handler->display->display_options['filters']['og_group_ref_target_id']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
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
    'meter_site' => 'meter_site',
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
  /* Filter criterion: Content: Site Category (field_site_category) */
  $handler->display->display_options['filters']['field_site_category_target_id']['id'] = 'field_site_category_target_id';
  $handler->display->display_options['filters']['field_site_category_target_id']['table'] = 'field_data_field_site_category';
  $handler->display->display_options['filters']['field_site_category_target_id']['field'] = 'field_site_category_target_id';
  $handler->display->display_options['filters']['field_site_category_target_id']['group'] = 1;
  $handler->display->display_options['filters']['field_site_category_target_id']['exposed'] = TRUE;
  $handler->display->display_options['filters']['field_site_category_target_id']['expose']['operator_id'] = 'field_site_category_target_id_op';
  $handler->display->display_options['filters']['field_site_category_target_id']['expose']['label'] = 'Category';
  $handler->display->display_options['filters']['field_site_category_target_id']['expose']['operator'] = 'field_site_category_target_id_op';
  $handler->display->display_options['filters']['field_site_category_target_id']['expose']['identifier'] = 'field_site_category_target_id';
  $handler->display->display_options['filters']['field_site_category_target_id']['expose']['remember_roles'] = array(
    2 => '2',
    1 => 0,
    3 => 0,
    4 => 0,
  );
  $handler->display->display_options['filters']['field_site_category_target_id']['group_info']['label'] = 'Site Category (field_site_category)';
  $handler->display->display_options['filters']['field_site_category_target_id']['group_info']['identifier'] = 'field_site_category_target_id';
  $handler->display->display_options['filters']['field_site_category_target_id']['group_info']['remember'] = FALSE;
  $handler->display->display_options['filters']['field_site_category_target_id']['group_info']['group_items'] = array(
    1 => array(),
    2 => array(),
    3 => array(),
  );

  /* Display: Page */
  $handler = $view->new_display('page', 'Page', 'page');
  $handler->display->display_options['path'] = 'admin/content/sites';
  $handler->display->display_options['menu']['type'] = 'tab';
  $handler->display->display_options['menu']['title'] = 'Sites';
  $handler->display->display_options['menu']['weight'] = '-1';
  $handler->display->display_options['menu']['context'] = 0;
  $handler->display->display_options['menu']['context_only_inline'] = 0;
  $export['sites'] = $view;

  return $export;
}
