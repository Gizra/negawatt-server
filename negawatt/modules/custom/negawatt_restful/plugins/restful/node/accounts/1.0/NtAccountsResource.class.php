<?php

/**
 * @file
 * Contains NtAccountsResource.
 */
class NtAccountsResource extends \NtEntityBaseNode {

  /**
   * Overrides \RestfulEntityBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['location'] = array(
      'property' => 'field_location',
    );

    $public_fields['type'] = array(
      'property' => 'field_account_type'
    );

    $public_fields['counter_list'] = array(
      'callback' => array($this, 'getCounters'),
    );

    return $public_fields;
  }

  /**
   * Get the counters list of the account.
   */
  function getCounters(\EntityMetadataWrapper $wrapper) {
    $nid = $wrapper->getIdentifier();

    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'iec_counter')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $nid)
      ->propertyOrderBy('nid')
      ->execute();

    if (empty($result['node'])) {
      return;
    }

    $nids = array_keys($result['node']);

    $handler = restful_get_restful_handler('iec_counters');
    return $handler->get(implode(',', $nids));
  }
}