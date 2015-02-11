<?php

/**
 * @file
 * Contains NegawattElectricityResource.
 */

class NegawattElectricityResource extends \RestfulDataProviderDbQuery implements \RestfulDataProviderDbQueryInterface {

  /**
   * Overrides \RestfulBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields['timestamp'] = array(
      'property' => 'timestamp'
    );

    $public_fields['datatime'] = array(
      'property' => 'datetime'
    );

    $public_fields['rate_type'] = array(
      'property' => 'rate_type'
    );

    $public_fields['type'] = array(
      'property' => 'type'
    );

    $public_fields['kwh'] = array(
      'property' => 'sum_kwh'
    );

    $public_fields['avg_power'] = array(
      'property' => 'avg_power'
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
      'resource' => array(
        'satec_meter' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
        'iec_meter' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
      ),
    );
    
    $public_fields['meter_category'] = array(
      'property' => 'meter_category',
      'column_for_query' => 'cat.field_meter_category_target_id',
    );

    $public_fields['min_power_factor'] = array(
      'property' => 'min_power_factor',
    );

    return $public_fields;
  }

  /**
   * {@inheritdoc}
   */
  public function getQuery() {
    $query = parent::getQuery();

    // Add a query for meter_categories.
    $field = field_info_field('field_meter_category');
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'cat', 'cat.entity_id=meter_nid');
    $query->addField('cat', 'field_meter_category_target_id', 'meter_category');

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Make summary fields
    $query->addExpression('SUM(sum_kwh)', 'sum_kwh');
    $query->addExpression('MIN(min_power_factor)', 'min_power_factor');
    $query->addExpression('AVG(avg_power)', 'avg_power');

    // Set grouping.
    $query->groupBy('timestamp');
    $query->groupBy('rate_type');
    $query->groupBy('type');

    return $query;
  }

  /**
   * Override RestfulBase::parseRequestForListFilter.
   *
   * Modify the filter for meter-category to catch all the electricity
   * entities that belong to the given meter-category, or any of its
   * children. E.g., if a meter-category of educational-buildings is given,
   * catch all the entities that belong to schools or kindergartens as well.
   *
   * @return array
   *    Modified filters array.
   */
  protected function parseRequestForListFilter() {
    $filters = parent::parseRequestForListFilter();

    // Modify meter category filter
    foreach ($filters as &$filter) {
      // Not meter-category, skip.
      if ($filter['public_field'] != 'meter_category') {
        continue;
      }

      // Find meter-category taxonomy vid
      $tax_vid = taxonomy_vocabulary_machine_name_load('meter_category')->vid;

      // Modify the filter to find entities with meter-category as given
      // in the filter, or any of its children
      $term_ids = array();
      foreach ($filter['value'] as $term_id) {
        // Get meter category list of children.
        $tree = taxonomy_get_tree($tax_vid, $term_id);
        // The category itself is not in the tree, add it manually.
        $term_ids[$term_id] = $term_id;
        // Add all terms in the tree to term-ids.
        foreach ($tree as $term) {
          $term_ids[$term->tid] = $term->tid;
        }
      }

      // Modify the filter to find all entities with meter-category in the set
      // we just found.
      $filter['value'] = $term_ids;
      $filter['operator'][0] = 'IN';
    }

    return $filters;
  }
}
