<?php

/**
 * @file
 * Contains NegawattOccupancyRawResource.
 */

class NegawattOccupancyRawResource extends RestfulEntityBase {

  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Remove not necessary fields.
    unset($public_fields['label'], $public_fields['self']);

    $public_fields['timestamp'] = array(
      'property' => 'timestamp'
    );

    $public_fields['datetime'] = array(
      'property' => 'timestamp',
      'callback' => array($this, 'timestampToDatetime'),
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
      'resource' => array(
        'occupancy_meter' => array(
          'name' => 'occupancy_meters',
          'full_view' => FALSE,
        ),
      ),
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency',
    );

    $public_fields['occupancy_abs'] = array(
      'property' => 'occupancy_abs'
    );

    $public_fields['occupancy_rel'] = array(
      'property' => 'occupancy_rel'
    );

    $public_fields['guests'] = array(
      'property' => 'guests'
    );

    return $public_fields;
  }

  /**
   * {@inheritdoc}
   *
   * Override RestfulEntityBase::createEntity() to test if meter already exists,
   * to allow update existing nodes in stead of creating a copy.
   */
  public function createEntity() {
    // If datetime field was given, convert it to timestamp.
    if (!empty($this->request['datetime'])) {
      // Note the '|' in the format string, which resets other fields (hour, minute...) to zero.
      $this->request['timestamp'] = date_timestamp_get(date_create_from_format('d/m/Y|', $this->request['datetime']));
      unset($this->request['datetime']);
    }

    // Check if an occupancy entity with the same parameters exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'occupancy_raw')
      ->propertyCondition('meter_nid', $this->request['meter'])
      ->propertyCondition('timestamp', $this->request['timestamp'])
      ->propertyCondition('frequency', $this->request['frequency'])
      ->range(0,1)
      ->execute();

    if (!empty($result['occupancy_raw'])) {
      // Node exists, update it.
      $id = key($result['occupancy_raw']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }

  /**
   * {@inheritdoc}
   */
  public function getQueryForList() {
    // Override getQuery.
    // Make sure meter field filter exists.

    // Prepare a sum query.
    $request = $this->getRequest();
    $filter = !empty($request['filter']) ? $request['filter'] : array();
    $meter = !empty($filter['meter']) ? $filter['meter'] : NULL;

    // Make sure there is 'meter' filter.
    if (!$meter) {
      throw new \RestfulBadRequestException('Please supply filter[meter].');
    }

    return parent::getQueryForList();
  }

  protected function timestampToDatetime($wrapper) {
    return date('d/m/Y', $wrapper->timestamp->value());
  }
}
