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

    $public_fields['temperature'] = array(
      'property' => 'temperature'
    );

    $public_fields['humidity'] = array(
      'property' => 'humidity'
    );

    $public_fields['meter'] = array(
      'property' => 'meter_nid',
    );

    $public_fields['frequency'] = array(
      'property' => 'frequency',
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
   * @return array
   *   Array of entities, as passed to RestfulEntityBase::viewEntity().
   *
   * @throws RestfulBadRequestException
   */
  public function getList() {
    $request = $this->getRequest();

    if (empty($request['key'])) {
      // 'key' parameter was not given, run standard RESTful getList()
      return parent::getList();
    }

    // 'key' parameter was given, create new climate entity.

    // Make sure required parameters are given.
    $required_parameters = array('account', 'timestamp', 'key');
    foreach ($required_parameters as $required_parameter) {
      if (empty($request[$required_parameter])) {
        throw new \RestfulBadRequestException(format_string('Please supply \'@param\' parameter.', array('@param' => $required_parameter)));
      }
    }

    // Read parameters.
    $account = !empty($request['account']) ? $request['account'] : NULL;
    $temperature = !empty($request['temperature']) ? $request['temperature'] : NULL;
    $humidity = !empty($request['humidity']) ? $request['humidity'] : NULL;
    $timestamp = !empty($request['time']) ? $request['time'] : NULL;
    $key = !empty($request['key']) ? $request['key'] : NULL;

    // Check key.
    $key_base = 214357;
    $calculated_key = ($temperature * $humidity * $timestamp) % $key_base;
    if ($key != $calculated_key) {
      throw new \RestfulBadRequestException('Wrong key parameter.');
    }
    // Key ok, remove it from the request since it's not a value parameter
    unset($request['key']);

    // Create the entity.
    return $this->createEntity();
  }


}
