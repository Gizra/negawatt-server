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

    $public_fields['avg_data'] = array(
      'property' => 'avg_data'
    );

    $public_fields['max_data'] = array(
      'property' => 'max_data'
    );

    $public_fields['min_data'] = array(
      'property' => 'min_data'
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
   * {@inheritdoc}
   */
  public function getQuery() {
    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $sensor = !empty($filter['sensor']) ? $filter['sensor'] : NULL;

    // Make sure there is 'sensor_account' filter.
    if (!$sensor) {
      throw new \RestfulBadRequestException('Please supply filter[sensor].');
    }

    $query = parent::getQuery();

    // Round the timestamp to nearest 10 min
    $query->addExpression('FLOOR(timestamp / 600) * 600', 'timestamp_rounded');

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Make summary fields
    $query->addExpression('AVG(avg_data)', 'avg_data');
    $query->addExpression('MIN(min_data)', 'min_data');
    $query->addExpression('MAX(max_data)', 'max_data');

    // Set grouping.
    // If filtering for 'sensor IN ...', don't sum over sensors - add a group by sensor.
    if (!empty($this->request['filter']['sensor']['operator']) && $this->request['filter']['sensor']['operator'] == 'IN') {
      $query->groupBy('meter_nid');
    }
    $query->groupBy('timestamp_rounded');
    $query->groupBy('negawatt_sensor_normalized.frequency');

    return $query;
  }
}
