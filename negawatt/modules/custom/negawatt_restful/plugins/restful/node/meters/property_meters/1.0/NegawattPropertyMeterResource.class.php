<?php

/**
 * @file
 * Contains NegawattMeterResource.
 */
class NegawattPropertyMeterResource extends \RestfulEntityBaseMultipleBundles {

  // Allow reading 200 meters at a time
  protected $range = 200;

  /**
   * Overrides \RestfulBase::controllersInfo().
   */
  public static function controllersInfo() {
    return array(
      '' => array(
        // GET returns a list of entities.
        \RestfulInterface::GET => 'getList',
      ),
      '^.*$' => array(
        \RestfulInterface::GET => 'viewEntities',
        \RestfulInterface::HEAD => 'viewEntities',
      ),
    );
  }

  /**
   * {@inheritdoc}
   *
   * Pipe the 'meters' entry point to the relevant meter handler.
   */
  public function viewEntities($ids_string) {
    $ids = array_unique(array_filter(explode(',', $ids_string)));
    $output = array();

    $account = $this->getAccount();

    foreach ($ids as $id) {
      $node = node_load($id);

      // The resource, by convention, is the plural form of the content-type
      // (for 'modbus_meter', it'll be 'modbus_meters').
      $resource = $node->type . 's';
      $handler = restful_get_restful_handler($resource);
      // Pipe the account.
      $handler->setAccount($account);

      // Get the meter.
      $output[] = $handler->viewEntity($id);
    }

    return $output;
  }

  // Will automatically redirect Modbus meters to NegawattModbusMeterResource.class.php
  // and IEC meters to NegawattIecMeterResource.class.php

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Declare common public fields to all the meters so filtering could work.

    $public_fields['type'] = array(
      'property' => 'type',
    );

    $public_fields['location'] = array(
      'property' => 'field_location',
    );

    $public_fields['place_description'] = array(
      'property' => 'field_place_description',
    );

    $public_fields['place_address'] = array(
      'property' => 'field_place_address',
    );

    $public_fields['place_locality'] = array(
      'property' => 'field_place_locality',
    );

    $public_fields['account'] = array(
      'property' => OG_AUDIENCE_FIELD,
      'resource' => array(
        'account' => array(
          'name' => 'accounts',
          'full_view' => FALSE,
        ),
      ),
    );

    $public_fields['max_frequency'] = array(
      'property' => 'field_max_frequency',
    );

    return $public_fields;
  }
}
