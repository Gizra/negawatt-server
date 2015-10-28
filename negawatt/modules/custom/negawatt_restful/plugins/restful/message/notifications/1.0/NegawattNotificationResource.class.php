<?php

/**
 * @file
 * Contains NegawattMeterResource.
 */
class NegawattNotificationResource extends \RestfulEntityBaseMultipleBundles {

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
   * Pipe the 'notifications' entry point to the relevant notification handler.
   */
  public function viewEntities($ids_string) {
    $ids = array_unique(array_filter(explode(',', $ids_string)));
    $output = array();

    $account = $this->getAccount();

    foreach ($ids as $id) {
      $message = message_load($id);

      if (preg_match('/^demand_/', $message->type)) {
        $resource = $message->type;
      }
      $handler = restful_get_restful_handler($resource);
      // Pipe the account.
      $handler->setAccount($account);

      // Get the meter.
      $output[] = $handler->viewEntity($id);
    }
    return $output;
  }

  /**
   * Overrides RestfulEntityBaseMultipleBundles::getQueryForList().
   */
  public function queryForListFilter(\EntityFieldQuery $query) {
    // Prepare list of valid accounts for current user.
    $account = $this->getAccount();
    $valid_groups = og_get_groups_by_user($account);

    // If no valid group was found, put a fake group, so the fieldCondition
    // will not fail, though will not match any message.
    if (empty($valid_groups)) {
      $valid_groups = array('node' => array());
    }

    parent::queryForListFilter($query);
    // Accept only messages in the valid groups
    $query->fieldCondition('field_meter_account', 'target_id', $valid_groups['node'], 'IN');
  }

  // Will automatically redirect Modbus meters to NegawattModbusMeterResource.class.php
  // and IEC meters to NegawattIecMeterResource.class.php

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Declare common public fields to all the meters so filtering could work.

    $public_fields['timestamp'] = array(
      'property' => 'timestamp'
    );

    // Message short-text, after placeholder replacement
    $public_fields['text'] = array(
      'property' => 'mid',
      'process_callbacks' => array(
        array($this, 'getText'),
      ),
    );

    // Message long-text, after placeholder replacement
    $public_fields['longText'] = array(
      'property' => 'mid',
      'process_callbacks' => array(
        array($this, 'getLongText'),
      ),
    );

    // Node Id of meter.
    $public_fields['meter'] = array(
      'property' => 'field_meter',
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

    $public_fields['meter_account'] = array(
      'property' => 'field_meter_account',
      'resource' => array(
        'account' => array(
          'name' => 'accounts',
          'full_view' => FALSE,
        ),
      ),
    );

    return $public_fields;
  }

  /**
   * Return message text of partial 0 (short text).
   *
   * @param $id
   *  Message Id.
   *
   * @return string
   *  Message string after placeholder replacement.
   */
  protected function getText($id) {
    $message = message_load($id);
    return $message->getText(LANGUAGE_NONE, array('partials' => TRUE, 'partial delta' => 0));
  }

  /**
   * Return message text of partial 1 (long description).
   *
   * @param $id
   *  Message Id.
   *
   * @return string
   *  Message string after placeholder replacement.
   */
  protected function getLongText($id) {
    $message = message_load($id);
    return $message->getText(LANGUAGE_NONE, array('partials' => TRUE, 'partial delta' => 1));
  }
}
