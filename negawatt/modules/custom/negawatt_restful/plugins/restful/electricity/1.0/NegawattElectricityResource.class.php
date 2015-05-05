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
      'property' => 'type',
      // To prevent conflict with og_membership 'type' field.
      'column_for_query' => 'negawatt_electricity_normalized.type',
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
      'column_for_query' => 'cat.og_vocabulary_target_id',
    );

    $public_fields['meter_account'] = array(
      'property' => 'meter_account',
      'column_for_query' => 'acc.gid',
    );

    $public_fields['min_power_factor'] = array(
      'property' => 'min_power_factor',
    );

    return $public_fields;
  }

  /**
   * Prepare data for summary section.
   *
   * Prepare a list of sub-categories and their total electricity (kWh)
   * consumption. The summary will be used by the formatter to add a 'summary'
   * section at the end of the RESTFUL reply.
   *
   * @throws RestfulBadRequestException
   *  If an unknown filter field was supplied.
   */
  protected function prepareSummary() {
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $meter_account = $filter['meter_account'];

    $query = db_select('negawatt_electricity_normalized', 'e');

    // Handle 'account' filter (if exists)
    if (!empty($filter['meter_account'])) {
      // Bother add account filtering only if no 'meter' filter exists.
      // If meter filter exists, it'll also filter for the account.
      if (empty($filter['meter'])) {
        // Add condition - the OG membership of the meter-node is equal to the
        // account id in the request.
        $query->join('node', 'n', 'n.nid = e.meter_nid');
        $query->join('og_membership', 'og', 'og.etid = n.nid');
        $query->condition('og.entity_type', 'node');
        $query->condition('og.gid', $filter['meter_account']);
      }
      unset($filter['meter_account']);
    }

    // Handle 'type' filter
    if (!empty($filter['type'])) {
      $query->condition('e.type', $filter['type']);
      unset($filter['type']);
    }

    // Handle 'timestamp' filter
    // Make sure it's a 'BETWEEN' filter
    if (!empty($filter['timestamp']) && !empty($filter['timestamp']['operator']) && $filter['timestamp']['operator'] == 'BETWEEN') {
      $query->condition('e.timestamp', $filter['timestamp']['value'][0], '>=');
      $query->condition('e.timestamp', $filter['timestamp']['value'][1], '<');
      unset($filter['timestamp']);
    }

    // Handle meter categories.

    // Bother handling category filtering only if no 'meter' filter exists.
    // If meter filter exists, it'll also filter for the category.
    $result_type = '';
    if (empty($filter['meter'])) {
      // If none given, take 0 (root) as default.
      $parent_category = !empty($filter['meter_category']) ? $filter['meter_category'] : 0;
      // Figure out vocab id from group id (the reverse of og_vocab_relation_get() function.
      $vocabulary_id = db_select('og_vocab_relation', 'ogr')
        ->fields('ogr', array('vid'))
        ->condition('gid', $meter_account)
        ->execute()
        ->fetchField();

      // Get list of child taxonomy terms.
      $taxonomy_array = taxonomy_get_tree($vocabulary_id, $parent_category);
      if (empty($taxonomy_array)) {
        // No sub categories were found. Show division by meters.
        $result_type = 'meter';

        // Find all meters attached to the category.
        $meters = taxonomy_select_nodes($parent_category, FALSE);

        // Check that there are meters in this category.
        if (empty($meters)) {
          // Return empty total section.
          $summary['type'] = $result_type;
          $summary['values'] = new stdClass();

          // Pass info to the formatter
          $this->valueMetadata[$_SERVER['REQUEST_TIME_FLOAT']]['summary'] = $summary;
          return;
        }

        // Sum electricity according to meters in category.
        $query->condition('e.meter_nid', $meters, 'IN');
        $query->fields('e', array('meter_nid'));
        $query->groupBy('e.meter_nid');
      }
      else {
        // Sub categories were found, show division by sub categories.
        $result_type = 'category';

        // Build an mapping array: cat_id => array(all child cat ids);
        $child_cat_mapping = array();
        foreach ($taxonomy_array as $term) {
          if ($term->depth == 0) {
            // Direct child, add new row to child-cat-mapping.
            $child_cat_mapping[$term->tid] = array($term->tid);
          }
          else {
            // Deep level child, add to the proper row.
            foreach ($child_cat_mapping as $key => $map) {
              // @fixme: is it possible that a term will have more than one parent?
              $parent = $term->parents[0];
              if (in_array($parent, $map)) {
                // Add the parent to the list under key.
                $child_cat_mapping[$key][] = $term->tid;
                break;
              }
            }
          }
        }
        // Extract only tid from the taxonomy terms.
        $child_categories = array_map(function ($term) {
          return $term->tid;
        }, $taxonomy_array);
        $query->join('field_data_og_vocabulary', 'cat', 'cat.entity_id = e.meter_nid');
        $query->condition('cat.og_vocabulary_target_id', $child_categories, 'IN');
        $query->join('taxonomy_term_data', 'tax', 'tax.tid = cat.og_vocabulary_target_id');
        $query->fields('tax', array('tid', 'name'));
        $query->groupBy('cat.og_vocabulary_target_id');
      }
    }
    unset($filter['meter_category']);

    // Handle 'meter' filter (if exists)
    if (!empty($filter['meter'])) {
      $result_type = 'meter';
      $query->condition('e.meter_nid', $filter['meter']);
      $query->fields('e', array('meter_nid'));
      $query->groupBy('e.meter_nid');
      unset($filter['meter']);
    }

    // Make sure we handled all the filter fields.
    if (!empty($filter)) {
      throw new \RestfulBadRequestException(format_string('Unknown fields in filter: @filters', array('@filters' => implode(', ', array_keys($filter)))));
    }

    // Add expressions for electricity total.
    $query->addExpression('SUM(e.sum_kwh)', 'sum');

    $result = $query->execute();

    $total = array();
    if ($result_type == 'meter') {
      // Collect meters' totals.
      $total = $result->fetchAllKeyed();
    }
    else {
      // Sum all child categories' totals into the parent category.
      foreach ($result as $row) {
        // Look for the parent category, under which to sum the kWhs
        foreach ($child_cat_mapping as $parent => $children_map) {
          if (in_array($row->tid, $children_map)) {
            // Add the parent to the list under key.
            $total[$parent] += $row->sum;
            break;
          }
        }
      }
    }

    // Prepare total section to output by the formatter.
    $summary['type'] = $result_type;
    $summary['values'] = $total;

    // Pass info to the formatter
    $this->valueMetadata[$_SERVER['REQUEST_TIME_FLOAT']]['summary'] = $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function getQuery() {
    // Handle summary section
    // Pass to the formatter a summary of all categories and their total kWh consumption.

    // Prepare summary data for the formatter.
    $this->prepareSummary();

    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $meter_account = !empty($filter['meter_account']) ? $filter['meter_account'] : NULL;

    // Make sure there is 'meter_account' filter.
    if (!$meter_account) {
      throw new \RestfulBadRequestException('Please supply filter[meter_account].');
    }

    $query = parent::getQuery();

    // Add a query for meter_category.
    $field = field_info_field(OG_VOCAB_FIELD);
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'cat', 'cat.entity_id=meter_nid');
    $query->addField('cat', 'og_vocabulary_target_id', 'meter_category');

    // Add a query for meter_account.
    $table_name = 'og_membership';
    $query->leftJoin($table_name, 'acc', 'acc.etid=meter_nid');
    $query->addField('acc', 'gid', 'meter_account');

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Make summary fields
    $query->addExpression('SUM(sum_kwh)', 'sum_kwh');
    $query->addExpression('MIN(min_power_factor)', 'min_power_factor');
    $query->addExpression('AVG(avg_power)', 'avg_power');

    // Set grouping.
    // If filtering for 'meter IN ...', don't sum over meters - add a group by meter.
    if (!empty($this->request['filter']['meter']['operator']) && $this->request['filter']['meter']['operator'] == 'IN') {
      $query->groupBy('meter_nid');
    }
    $query->groupBy('timestamp');
    $query->groupBy('rate_type');
    $query->groupBy('negawatt_electricity_normalized.type');

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

      // Modify the filter to find entities with meter-category as given
      // in the filter, or any of its children
      $term_ids = array();
      foreach ($filter['value'] as $term_id) {

        $term = taxonomy_term_load($term_id);
        // Get meter category list of children.
        $tree = taxonomy_get_tree($term->vid, $term_id);
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
