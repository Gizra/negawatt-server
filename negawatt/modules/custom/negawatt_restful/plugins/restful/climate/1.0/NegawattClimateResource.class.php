<?php

/**
 * @file
 * Contains NegawattClimateResource.
 */

class NegawattClimateResource extends \RestfulDataProviderDbQuery implements \RestfulDataProviderDbQueryInterface {

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

    $public_fields['avg_temp'] = array(
      'property' => 'avg_temp'
    );

    $public_fields['max_temp'] = array(
      'property' => 'max_temp'
    );

    $public_fields['min_temp'] = array(
      'property' => 'min_temp'
    );

    $public_fields['deg_days'] = array(
      'property' => 'deg_days'
    );

    $public_fields['avg_humidity'] = array(
      'property' => 'avg_humidity'
    );

    $public_fields['max_humidity'] = array(
      'property' => 'max_humidity'
    );

    $public_fields['min_humidity'] = array(
      'property' => 'min_humidity'
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
      'access_callbacks' => array(array($this, 'meterFieldAccess')),
      'resource' => array(
        'climate_meter' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
      ),
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
   * {@inheritdoc}
   */
  public function getQuery() {
    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $meter = !empty($filter['meter']) ? $filter['meter'] : NULL;

    // Make sure there is 'meter_account' filter.
    if (!$meter) {
      throw new \RestfulBadRequestException('Please supply filter[meter].');
    }

    $query = parent::getQuery();

    // Round the timestmap to nearest 10 min
    $query->addExpression('FLOOR(timestamp / 600) * 600', 'timestamp_rounded');

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Make summary fields
    $query->addExpression('AVG(avg_temp)', 'avg_temp');
    $query->addExpression('MIN(min_temp)', 'min_temp');
    $query->addExpression('MAX(max_temp)', 'max_temp');
    $query->addExpression('SUM(deg_days)', 'deg_days');

    $query->addExpression('AVG(avg_humidity)', 'avg_humidity');
    $query->addExpression('MIN(min_humidity)', 'min_humidity');
    $query->addExpression('MAX(max_humidity)', 'max_humidity');

    // Set grouping.
    // If filtering for 'meter IN ...', don't sum over meters - add a group by meter.
    if (!empty($this->request['filter']['meter']['operator']) && $this->request['filter']['meter']['operator'] == 'IN') {
      $query->groupBy('meter_nid');
    }
    $query->groupBy('timestamp_rounded');
    $query->groupBy('negawatt_climate_normalized.frequency');

    return $query;
  }
}
