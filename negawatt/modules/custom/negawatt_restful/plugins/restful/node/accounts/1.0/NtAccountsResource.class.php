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

    $public_fields['meter_list'] = array(
      'callback' => array($this, 'getMeters'),
    );

    return $public_fields;
  }

  /**
   * Get the meters list of the account.
   */
  function getMeters(\EntityMetadataWrapper $wrapper) {
    $nid = $wrapper->getIdentifier();

    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'iec_meter')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $nid)
      ->propertyOrderBy('nid')
      ->execute();

    if (empty($result['node'])) {
      return;
    }

    $nids = array_keys($result['node']);

    $handler = restful_get_restful_handler('iec_meters');
    return $handler->get(implode(',', $nids));
  }
}