<?php

/**
 * @file
 * Contains NegawattOccupancyResource.
 */

class NegawattOccupancyResource extends \RestfulDataProviderDbQuery implements \RestfulDataProviderDbQueryInterface {

  // Allow reading 200 items at a time
  protected $range = 200;

  /**
   * Overrides \RestfulBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields['timestamp'] = array(
      'property' => 'timestamp',
    );

    $public_fields['datatime'] = array(
      'property' => 'datetime'
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency'
    );

    $public_fields['avg_occupancy'] = array(
      'property' => 'avg_occupancy'
    );

    $public_fields['max_occupancy'] = array(
      'property' => 'max_occupancy'
    );

    $public_fields['min_occupancy'] = array(
      'property' => 'min_occupancy'
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
      'access_callbacks' => array(array($this, 'meterFieldAccess')),
      'resource' => array(
        'occupancy_meter' => array(
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

    // Add human readable date-time field
    $query->addExpression('from_unixtime(timestamp) ', 'datetime');

    // Make summary fields
    $query->addExpression('AVG(avg_occupancy)', 'avg_occupancy');
    $query->addExpression('MIN(min_occupancy)', 'min_occupancy');
    $query->addExpression('MAX(max_occupancy)', 'max_occupancy');

    // Set grouping.
    // If filtering for 'meter IN ...', don't sum over meters - add a group by meter.
    if (!empty($this->request['filter']['meter']['operator']) && $this->request['filter']['meter']['operator'] == 'IN') {
      $query->groupBy('meter_nid');
    }
    $query->groupBy('timestamp');
    $query->groupBy('negawatt_occupancy_normalized.frequency');

    return $query;
  }
}
