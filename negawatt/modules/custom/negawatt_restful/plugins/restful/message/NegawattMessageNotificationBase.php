<?php

/**
 * @file
 * Contains base class for negawatt-notification resources.
 */
class NegawattMessageNotificationBase extends \RestfulEntityBase {
  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Remove not necessary fields.
    unset($public_fields['label']);

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

    $public_fields['meter_title'] = array(
      'property' => 'field_message_meter_title',
    );

    $public_fields['description'] = array(
      'property' => 'field_message_place_description',
    );

    $public_fields['address'] = array(
      'property' => 'field_message_place_address',
    );

    return $public_fields;
  }

  /**
   * {@inheritdoc}
   *
   * Return the basic entity field query for messages, with additional filter
   * that matches only messages accessible by the current user.
   */
  public function getEntityFieldQuery() {

    $query = parent::getEntityFieldQuery();

    // Add condition to match only messages accessible by the current user.
    // Find the list of valid OGs for current user
    $account = $this->getAccount();
    $wrapper = entity_metadata_wrapper('user', $account);
    $gids = $wrapper->og_user_node->value(array('identifier' => TRUE));

    if (!$gids) {
      // User is not a member in any group.
      throw new \RestfulUnauthorizedException('Current user is not related to any account. No messages to show.');
    }

    // Filter to match only messages from these OGs
    $query->fieldCondition('field_meter_account', 'target_id', $gids, 'IN');

    return $query;
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
