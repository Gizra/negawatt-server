<?php

/**
 * @file
 * Contains NegawattElectricityResource.
 */

class NegawattElectricityResource extends \RestfulDataProviderDbQuery implements \RestfulDataProviderDbQueryInterface {

  // Allow reading 200 meters at a time
  protected $range = 200;

  /**
   * Overrides \RestfulBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields['timestamp'] = array(
      'property' => 'timestamp',
    );

    $public_fields['timestamp_rounded'] = array(
      'property' => 'timestamp_rounded',
    );

    $public_fields['datatime'] = array(
      'property' => 'datetime'
    );

    $public_fields['rate_type'] = array(
      'property' => 'rate_type'
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency',
      // To prevent conflict with og_membership 'frequency' field.
      'column_for_query' => 'negawatt_electricity_normalized.frequency',
    );

    $public_fields['kwh'] = array(
      'property' => 'sum_kwh'
    );

    $public_fields['avg_power'] = array(
      'property' => 'avg_power'
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
      'access_callbacks' => array(array($this, 'meterFieldAccess')),
      'resource' => array(
        'modbus_meter' => array(
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
      'column_for_query' => 'meter_cat.field_meter_category_target_id',
    );

    $public_fields['meter_account'] = array(
      'property' => 'meter_account',
      'column_for_query' => 'acc.gid',
    );

    $public_fields['meter_site'] = array(
      'property' => 'meter_site',
      'column_for_query' => 'site.field_meter_site_target_id',
    );

    $public_fields['site_category'] = array(
      'property' => 'site_category',
      'column_for_query' => 'site_cat.field_site_category_target_id',
    );

    $public_fields['min_power_factor'] = array(
      'property' => 'min_power_factor',
    );

    return $public_fields;
  }

  /**
   * An access callback that returns TRUE if having filter for meter. Otherwise FALSE.
   *
   * @param string $op
   *   The operation that access should be checked for. Can be "view" or "edit".
   *   Defaults to "edit".
   * @param string $public_field_name
   *   The name of the public field.
   * @param EntityMetadataWrapper $property_wrapper
   *   The wrapped property.
   * @param EntityMetadataWrapper $wrapper
   *   The wrapped entity.
   *
   * @return string
   *   "Allow" or "Deny" if user has access to the property.
   */
  public static function meterFieldAccess($op, $public_field_name, \EntityMetadataWrapper $property_wrapper, \EntityMetadataWrapper $wrapper) {
    // Get query filter.
    $request = $wrapper->request->value();
    $filter = !empty($request['filter']) ? $request['filter'] : array();

    return array_key_exists('meter', $filter) ? \RestfulInterface::ACCESS_ALLOW : \RestfulInterface::ACCESS_DENY;
  }

  /**
   * Get the list of sites related to site-category.
   *
   * @param $category_id
   *  Site category id.
   * @param $meter_account
   *  The meter-account.
   *
   * @return array
   *  Array of site ids.
   */
  protected function getSitesByCategory($category_id, $meter_account) {
    $query = new EntityFieldQuery();

    $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'meter_site')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition('field_site_category', 'target_id', $category_id)
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $meter_account);

    $result = $query->execute();

    if (empty($result['node'])) {
      return array();
    }

    return array_keys($result['node']);
  }

  /**
   * Get the list of meters related to a list of sites.
   *
   * @param $site_ids
   *  An array of site ids.
   * @param $meter_account
   *  The meter-account.
   *
   * @return array
   *  Array of meter ids.
   */
  protected function getMetersBySites($site_ids, $meter_account) {
    if (empty($site_ids)) {
      return array();
    }

    $query = new EntityFieldQuery();

    $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', array('iec_meter', 'modbus_meter'), 'IN')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition('field_meter_site', 'target_id', $site_ids, 'IN')
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $meter_account);

    $result = $query->execute();

    if (empty($result['node'])) {
      return array();
    }

    return array_keys($result['node']);
  }

  /**
   * Get the list of meters related to meter-category.
   *
   * @param $category_id
   *  Meter category id.
   * @param $meter_account
   *  The meter-account.
   *
   * @return array
   *  Array of site ids.
   */
  protected function getMetersByCategory($category_id, $meter_account) {
    $query = new EntityFieldQuery();

    $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', array('iec_meter', 'modbus_meter'), 'IN')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition('field_meter_category', 'target_id', $category_id)
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $meter_account);

    $result = $query->execute();

    if (empty($result['node'])) {
      return array();
    }

    return array_keys($result['node']);
  }

  /**
   * If $filter contains filter for 'site_category', modify $query to catch the
   * given category, and all its child categories.
   *
   * @param $query
   * @param $filter
   * @return array
   */
  protected function handleSiteCategoryFilter($query, &$filter, $addGrouping = TRUE) {
    // Handle site categories.

    // Bother handling category filtering only if no 'meter' filter exists.
    // If meter filter exists, it'll also filter for the category.
    $result_type = 'meters';
    if (!empty($filter['meter'])) {
      // Just set group by meter-nid
      if ($addGrouping) {
        $query->groupBy('meter_nid');
      }
      return array('result_type' => $result_type);
    }

    $meter_account = $filter['meter_account'];

    // Handle site-categories only if there's no meter-category filter.
    if (empty($filter['meter_category'])) {
      // If no category-filter was given, take 0 (root) as default.
      $parent_category_id = !empty($filter['site_category']) ? $filter['site_category'] : 0;
      // Figure out vocab id
      $vocabulary = taxonomy_vocabulary_machine_name_load('site_category');
      $vocabulary_id = $vocabulary->vid;
      // Get list of child taxonomy terms.
      $taxonomy_array = taxonomy_get_tree($vocabulary_id, $parent_category_id);
    }

    if (empty($taxonomy_array)) {
      // No sub categories were found (or filter by meter-category was given),
      // show division by meters.

      // Find all meters attached to the category.
      if (empty($filter['meter_category'])) {
        // No meter-category was given, use site-category.
        $sites = $this->getSitesByCategory($parent_category_id, $meter_account);
        $meters = $this->getMetersBySites($sites, $meter_account);
      }
      else {
        // Meter-category was given, use it to find the meters
        $meters = $this->getMetersByCategory($filter['meter_category'], $meter_account);
      }
    }

    if (empty($taxonomy_array)) {
      // No sub categories were found (or filter by meter-category was given),
      // show division by meters - meters list was prepared above.
      $result_type = 'meters';

      // Check that there are meters in this category.
      if (empty($meters)) {
        // Return empty total section.
        $summary['type'] = $result_type;
        $summary['values'] = new stdClass();
        return array('summary' => $summary);
      }

      // Modify the query to sum electricity according to the meters in the category.
      $query->condition('negawatt_electricity_normalized.meter_nid', $meters, 'IN');
      $query->fields('negawatt_electricity_normalized', array('meter_nid'));
      if ($addGrouping) {
        $query->groupBy('negawatt_electricity_normalized.meter_nid');
      }
    }
    else {
      // Sub categories were found, show division by sub categories.
      $result_type = 'site_categories';

      // Build a mapping array: cat_id => array(all child cat ids);
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
            // Look for the parent in each map row.
            if (in_array($parent, $map)) {
              // Add the term to the list under key.
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
      // Modify the query to sum electricity in each of the sub categories.
      // If parent category is 0 (that is, root category), there's no need to
      // add 'IN' condition for categories - just grab all of them.
      if ($parent_category_id != 0) {
        $query->condition('site_cat.field_site_category_target_id', $child_categories, 'IN');
      }
      $query->join('taxonomy_term_data', 'tax', 'tax.tid = site_cat.field_site_category_target_id');
      $query->fields('tax', array('tid', 'name'));
      if ($addGrouping) {
        $query->groupBy('site_cat.field_site_category_target_id');
      }
    }

    unset($filter['site_category']);

    return array(
      'result_type' => $result_type,
      'child_cat_mapping' => $child_cat_mapping
    );
  }

  /**
   * Finish preparing the query and execute it.
   *
   * @param $query
   * @return mixed
   */
  protected function queryForSummary($query) {
    // Add expressions for electricity total.
    $query->addExpression('SUM(negawatt_electricity_normalized.sum_kwh)', 'sum');

    return $query->execute();
  }

  /**
   * A modified copy of RestfulDataProviderDbQuery::queryForListFilter()
   *
   * Add filters from http request to the query. However, skip filter for
   * timestamp, since we don't want to limit the time range of the query.
   *
   * @param $query
   *    The query to modify.
   */
  protected function queryForListFilterNoTimestamp($query) {
    $public_fields = $this->getPublicFields();
    foreach ($this->parseRequestForListFilter() as $filter) {
      // Skip timestamp filter
      if ($this->getPropertyColumnForQuery($public_fields[$filter['public_field']]) == 'timestamp') {
        continue;
      }
      if (in_array(strtoupper($filter['operator'][0]), array('IN', 'BETWEEN'))) {
        $column_name = $this->getPropertyColumnForQuery($public_fields[$filter['public_field']]);
        $query->condition($column_name, $filter['value'], $filter['operator'][0]);
        continue;
      }
      $condition = db_condition($filter['conjunction']);
      for ($index = 0; $index < count($filter['value']); $index++) {
        $column_name = $this->getPropertyColumnForQuery($public_fields[$filter['public_field']]);
        $condition->condition($column_name, $filter['value'][$index], $filter['operator'][$index]);
      }
      $query->condition($condition);
    }
  }

  /**
   * Calculate min and max timestamp for electricity query.
   *
   * Build a query with all the filters and joins, like in prepareSummary().
   * Add calculation of the min and max timestamp of electricity data for the
   * account and frequency.
   *
   * @return array
   *  min and max timestamps for electricity.
   */
  protected function calcMinMaxTimestamp() {
    // Load query and apply filter options.
    $query = parent::getQuery();
    // Add request filters to query, but not timestamp filter.
    $this->queryForListFilterNoTimestamp($query);

    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();

    // Add a query for meter_category and meter_account.
    $this->addQueryForCategoryAndAccount($query);

    // Handle meter categories: for last level categories prepare for summary
    // of all meters in the category, for higher level categories prepare for
    // summary of all sub-categories.
    $cat_result = $this->handleSiteCategoryFilter($query, $filter, FALSE /*addGrouping*/);

    if (!empty($cat_result['summary'])) {
      // If summery was given, pass it to the formatter and quit.
      $this->valueMetadata['electricity']['summary'] = $cat_result['summary'];
      return;
    }

    // Add min/max timestamp expressions.
    $query->addExpression('MIN(timestamp)', 'min_ts');
    $query->addExpression('MAX(timestamp)', 'max_ts');

    // Finish query and get result.
    $result = $query->execute()->fetchAll();

    // Return info to be passed to the formatter.
    return array(
      'min' => $result[0]->min_ts,
      'max' => $result[0]->max_ts,
    );
  }

  /**
   * Return the total section of the summary, for 'meters' result type.
   *
   * @param $result
   *  Database query result.
   * @return mixed
   *  An array from meter ids to their electricity consumption.
   */
  protected function prepareTotalForMeters($result) {
    // Collect meters' totals as an array(meter_nid => sum).
    $total = array();
    foreach ($result as $row) {
      $total[$row->meter_nid] = $row->sum;
    }
    return $total;
  }

  /**
   * Return the total section of the summary, for 'categories' result type.
   *
   * @param $result
   *  Database query result.
   * @param $child_cat_mapping
   *  A map from category id to array of its child category ids.
   * @return mixed
   *  An array from category ids to their electricity consumption.
   */
  protected function prepareTotalForCategories($result, $child_cat_mapping) {
    // Sum all child categories' totals into the parent category, so only
    // direct child categories will be listed in the total section.
    $total = array();
    foreach ($result as $row) {
      // Look for the parent category, under which to sum the kWhs
      foreach ($child_cat_mapping as $parent => $children_map) {
        if (in_array($row->tid, $children_map)) {
          // Add the parent to the list under key.
          if (empty($total[$parent])) {
            $total[$parent] = 0;
          }
          $total[$parent] += $row->sum;
          break;
        }
      }
    }
    return $total;
  }

  /**
   * Return the total section of the summary, for 'sites' result type.
   *
   * Called when total-for-categories found only one category with electricity.
   * Look for the electricity consumption of the category's sites and prepare
   * a total section.
   *
   * @param $total
   *  An array with one entry category-id => consumption.
   * @return mixed
   *  An array from site ids to their electricity consumption.
   */
  protected function prepareTotalForSites($total, $meter_account) {
    // Get category id.
    $cat_id = array_keys($total)[0];

    // Query the sites that relate to this category id, and sum their electricity.

    // The section below was copied from the beginning of prepareSummary()
    // Load query and apply filter options.
    $query = parent::getQuery();
    $this->queryForListFilter($query);

    // Add a query for meter_category and meter_account.
    $this->addQueryForCategoryAndAccount($query);

    // Get list of sits.
    $sites = $this->getSitesByCategory($cat_id, $meter_account);
    if (empty($sites)) {
      // If no sites were found, return an empty array.
      return array();
    }
    // Modify the query to sum electricity according to the sites.
    $query->condition('site.field_meter_site_target_id', $sites, 'IN');
    // Group by site id
    $query->groupBy('site.field_meter_site_target_id');

    // Finish query and get result.
    $result = $this->queryForSummary($query);

    // Collect sites' totals as an array(meter_site => sum).
    $total = array();
    foreach ($result as $row) {
      $total[$row->meter_site] = $row->sum;
    }
    return $total;
  }

  /**
   * Prepare data for summary section.
   *
   * Prepare a list of sub-categories and their total electricity (kWh)
   * consumption. The summary will be used by the formatter to add a 'summary'
   * section at the end of the RESTFUL reply.
   *
   * @param $query
   */
  protected function addQueryForCategoryAndAccount($query) {
    // Add a query for meter_category.
    $field = field_info_field('field_meter_category');
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'meter_cat', 'meter_cat.entity_id=meter_nid');
    $query->addField('meter_cat', 'field_meter_category_target_id', 'meter_category');

    // Add a query for site.
    $field = field_info_field('field_meter_site');
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'site', 'site.entity_id=meter_nid');
    $query->addField('site', 'field_meter_site_target_id', 'meter_site');

    // Add a query for site_category.
    $field = field_info_field('field_site_category');
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'site_cat', 'site_cat.entity_id=site.field_meter_site_target_id');
    $query->addField('site_cat', 'field_site_category_target_id', 'site_category');

    // Add a query for meter_account.
    $table_name = 'og_membership';
    $query->leftJoin($table_name, 'acc', 'acc.etid=meter_nid');
    $query->addField('acc', 'gid', 'meter_account');
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

    // Load query and apply filter options.
    $query = parent::getQuery();
    $this->queryForListFilter($query);

    // Add a query for meter_category and meter_account.
    $this->addQueryForCategoryAndAccount($query);

    // Handle meter categories: for last level categories prepare for summary
    // of all meters in the category, for higher level categories prepare for
    // summary of all sub-categories.
    $cat_result = $this->handleSiteCategoryFilter($query, $filter);

    if (!empty($cat_result['summary'])) {
      // If summery was given, pass it to the formatter and quit.
      $this->valueMetadata['electricity']['summary'] = $cat_result['summary'];
      return;
    }

    $result_type = $cat_result['result_type'];
    $child_cat_mapping = $cat_result['child_cat_mapping'];

    // Finish query and get result.
    $result = $this->queryForSummary($query);

    if ($result_type == 'meters') {
      // Prepare the total section of the summary, for 'meters' result type.
      $total = $this->prepareTotalForMeters($result);
    }
    else {
      // Prepare the total section of the summary, for 'categories' result type.
      $total = $this->prepareTotalForCategories($result, $child_cat_mapping);

      if (count($total) == 1) {
        // Only one category was found. Show summary for its sites.
        $result_type = 'sites';
        $total = $this->prepareTotalForSites($total, $filter['meter_account']);
      }
    }

    // Fill the total section to be output by the formatter.
    $summary['type'] = $result_type;
    $summary['values'] = $total;
    // Add min and max timestamps for the account and frequency given.
    $summary['timestamp'] = $this->calcMinMaxTimestamp();

    // Pass info to the formatter
    $this->valueMetadata['electricity']['summary'] = $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function getQuery() {
    // Handle summary section
    // Pass to the formatter a summary of all categories and their total kWh consumption.

    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $meter_account = !empty($filter['meter_account']) ? $filter['meter_account'] : NULL;

    // Make sure there is 'meter_account' filter.
    if (!$meter_account) {
      throw new \RestfulBadRequestException('Please supply filter[meter_account].');
    }

    // Prepare summary data for the formatter.
    $this->prepareSummary();

    $query = parent::getQuery();

    // Add a query for meter_category and meter_account.
    $this->addQueryForCategoryAndAccount($query);

    // Round the timestmap to nearest 10 min
    $query->addExpression('FLOOR(timestamp / 600) * 600', 'timestamp_rounded');

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
    $query->groupBy('timestamp_rounded');
    $query->groupBy('rate_type');
    $query->groupBy('negawatt_electricity_normalized.frequency');

    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function getQueryForList() {
    // Handle 'nodata' parameter.
    $query = parent::getQueryForList();

    $request = $this->getRequest();
    if (!empty($request['nodata'])) {
      // 'nodata' parameter in the request means to omit all data from output,
      // leaving only summary. Since there's no electricity data with timestamp=0,
      // adding the condition below will remove all data from the response.
      $query->condition('timestamp', 0);
    }

    return $query;
  }

    /**
   * Override RestfulBase::parseRequestForListFilter.
   *
   * Modify the filter for site-category to catch all the electricity
   * entities that belong to the given site-category, or any of its
   * children. E.g., if a site-category of educational-buildings is given,
   * catch all the entities that belong to schools or kindergartens as well.
   *
   * @return array
   *    Modified filters array.
   */
  protected function parseRequestForListFilter() {
    $filters = parent::parseRequestForListFilter();

    // Modify site category filter
    foreach ($filters as &$filter) {
      // Not site-category, skip.
      if ($filter['public_field'] != 'site_category') {
        continue;
      }

      // Modify the filter to find entities with site-category as given
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

      // Modify the filter to find all entities with site-category in the set
      // we just found.
      $filter['value'] = $term_ids;
      $filter['operator'][0] = 'IN';
    }

    return $filters;
  }
}
