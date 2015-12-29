<?php

/**
 * @file
 * Contains NegawattSensorTreeResource.
 */

class NegawattSensorTreeResource extends \RestfulBase implements \RestfulDataProviderInterface {

  // Allow reading 200 items at a time
  protected $range = 200;

  /**
   * Overrides \RestfulBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields['id'] = array(
      'property' => 'id',
    );

    $public_fields['type'] = array(
      'property' => 'type',
    );

    $public_fields['label'] = array(
      'property' => 'label',
    );

    $public_fields['parent'] = array(
      'property' => 'parent'
    );

    return $public_fields;
  }

  /**
   * An access callback that returns TRUE if having filter for account. Otherwise FALSE.
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

    return array_key_exists('account', $filter) ? \RestfulInterface::ACCESS_ALLOW : \RestfulInterface::ACCESS_DENY;
  }

  /**
   * {@inheritdoc}
   */
//  public function getQueryForList() {
//    $query = new EntityFieldQuery();
//    return $query;
//  }


  /**
   * Get a list of entities.
   *
   * @return array
   *   Array of entities, as passed to RestfulEntityBase::viewEntity().
   *
   * @throws RestfulBadRequestException
   */
  public function getList() {
    $list = array(
      array(
        'id' => 1,
        'type' => 'site_category',
        'label' => 'school',
      )
    );

    return $list;
  }
}
