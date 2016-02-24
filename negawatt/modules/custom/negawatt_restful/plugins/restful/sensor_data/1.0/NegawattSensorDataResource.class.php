<?php

/**
 * @file
 * Contains NegawattSensorDataResource.
 */

class NegawattSensorDataResource extends \RestfulDataProviderDbQuery implements \RestfulDataProviderDbQueryInterface {

  // Allow reading 200 items at a time
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

    $public_fields['frequency'] = array(
      'property' => 'frequency'
    );

    $public_fields['avg_value'] = array(
      'property' => 'avg_value'
    );

    $public_fields['max_value'] = array(
      'property' => 'max_value'
    );

    $public_fields['min_value'] = array(
      'property' => 'min_value'
    );

    $public_fields['sensor'] = array(
      'property' => 'meter_nid',
      'access_callbacks' => array(array($this, 'meterFieldAccess')),
      'resource' => array(
        'sensor' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
      ),
    );


    $public_fields['sensor_type'] = array(
      'property' => 'sensor_type',
      'column_for_query' => 'sensor_type.field_sensor_type_target_id',
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

    return array_key_exists('sensor', $filter) ? \RestfulInterface::ACCESS_ALLOW : \RestfulInterface::ACCESS_DENY;
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
   * Prepare data for summary section.
   *
   * Prepare a list of sub-categories and their data.
   * The summary will be used by the formatter to add a 'summary'
   * section at the end of the RESTFUL reply.
   *
   * @param $query
   */
  protected function addQueryForCategoryAndAccount($query) {
    // Add a query for sensor_type.
    $field = field_info_field('field_sensor_type');
    $table_name = _field_sql_storage_tablename($field);
    $query->leftJoin($table_name, 'sensor_type', 'sensor_type.entity_id=meter_nid');
    $query->addField('sensor_type', 'field_sensor_type_target_id', 'sensor_type');

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
    // Fill the total section to be output by the formatter.
    // Add min and max timestamps for the account and frequency given.
    $summary['timestamp'] = $this->calcMinMaxTimestamp();

    // Pass info to the formatter
    $this->valueMetadata['electricity']['summary'] = $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function getQuery() {
    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $account = !empty($filter['meter_account']) ? $filter['meter_account'] : NULL;
    $sensor = !empty($filter['sensor']) ? $filter['sensor'] : NULL;

    // Make sure there is 'sensor_account' filter.
    if (!$sensor && !$account) {
      throw new \RestfulBadRequestException('Please supply filter[meter_account] or filter[sensor].');
    }

    // Prepare summary data for the formatter.
    $this->prepareSummary();

    $query = parent::getQuery();

    // Round the timestamp to nearest 10 min
    $query->addExpression('FLOOR(timestamp / 600) * 600', 'timestamp_rounded');

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Add a query for meter_category and meter_account.
    $this->addQueryForCategoryAndAccount($query);

    // Make summary fields
    $query->addExpression('AVG(avg_value)', 'avg_value');
    $query->addExpression('MIN(min_value)', 'min_value');
    $query->addExpression('MAX(max_value)', 'max_value');

    // Set grouping.
    // If filtering for 'sensor IN ...', don't sum over sensors - add a group by sensor.
    if (!empty($this->request['filter']['sensor']['operator']) && $this->request['filter']['sensor']['operator'] == 'IN') {
      $query->groupBy('meter_nid');
    }
    $query->groupBy('timestamp_rounded');
    $query->groupBy('negawatt_sensor_data_normalized.frequency');

    return $query;
  }

  /**
   * Override RestfulBase::parseRequestForListFilter.
   *
   * Modify the filter for site-category to catch all the sensor-data
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
