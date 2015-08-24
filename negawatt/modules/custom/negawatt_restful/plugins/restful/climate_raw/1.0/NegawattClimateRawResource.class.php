<?php

/**
 * @file
 * Contains NegawattClimateRawResource.
 */

class NegawattClimateRawResource extends RestfulEntityBase {

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
        'climate_meter' => array(
          'name' => 'climate_meter',
          'full_view' => FALSE,
        ),
      ),
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency',
    );

    $public_fields['temperature'] = array(
      'property' => 'temperature'
    );

    $public_fields['humidity'] = array(
      'property' => 'humidity'
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
    // Check if an climate entity with the same parameters exists.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'climate_raw')
      ->propertyCondition('meter_nid', $this->request['meter'])
      ->propertyCondition('timestamp', $this->request['timestamp'])
      ->propertyCondition('frequency', $this->request['frequency'])
      ->range(0,1)
      ->execute();

    if (!empty($result['climate_raw'])) {
      // Node exists, update it.
      $id = key($result['climate_raw']);
      return parent::updateEntity($id);
    }
    // New node.
    return parent::createEntity();
  }

  /**
   * Get a list of entities.
   *
   * {@inheritdoc}
   *
   * Override RestfulEntityBase::getList().
   * Allow to create new entity with GET query in stead of POST.
   */
  public function getList() {
    $request = $this->getRequest();

    if (empty($request['key'])) {
      // 'key' parameter was not given, run standard RESTful getList()
      return parent::getList();
    }

    // 'key' parameter was given, create new climate entity.

    // If datetime field was given, convert it to timestamp.
    if (!empty($this->request['datetime'])) {
      // Note the '|' in the format string, which resets other fields (hour, minute...) to zero.
      $this->request['timestamp'] = date_timestamp_get(date_create_from_format('d/m/Y|', $this->request['datetime']));
      unset($this->request['datetime']);
      $request = $this->getRequest();
    }

    // Make sure required parameters are given.
    $required_parameters = array('meter', 'timestamp', 'key');
    foreach ($required_parameters as $required_parameter) {
      if (empty($request[$required_parameter])) {
        throw new \RestfulBadRequestException(format_string('Please supply \'@param\' parameter.', array('@param' => $required_parameter)));
      }
    }

    // Read parameters.
    $meter = $request['meter'];
    $timestamp = $request['timestamp'];
    $key = $request['key'];
    $temperature = !empty($request['temperature']) ? $request['temperature'] : NULL;
    $humidity = !empty($request['humidity']) ? $request['humidity'] : NULL;

    // Check key.
    $key_base = 9482687;
    $calculated_key = ($meter * $timestamp) % $key_base;
    $calculated_key *= $temperature ? $temperature : 1;
    $calculated_key *= $humidity ? $humidity : 1;
    $calculated_key %= $key_base;
    if ($key != $calculated_key) {
      throw new \RestfulBadRequestException('Wrong key parameter.');
    }
    // Key ok, remove it from the request since it's not a value parameter
    unset($this->request['key']);
    unset($this->request['q']);

    // Create the entity.
    return $this->createEntity();
  }

  protected function timestampToDatetime($wrapper) {
    return date('d/m/Y', $wrapper->timestamp->value());
  }
}
