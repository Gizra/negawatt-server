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
//  public function getList() {
//    $list = array(
//      array(
//        'id' => 1,
//        'type' => 'site_category',
//        'label' => 'school',
//      )
//    );
//
//    return $list;
//  }

  /**
   * Get a list of entities.
   *
   * @return array
   *   Array of entities, as passed to RestfulEntityBase::viewEntity().
   *
   * @throws RestfulBadRequestException
   */
  public function index()
  {
    dpm('index');

    $list = array(
      array(
        'id' => 1,
        'type' => 'site_category',
        'label' => 'school',
      )
    );

    return $list;
  }

  /**
   * View a collection of items.
   *
   * @param array $ids
   *   An array of items to view.
   *
   * @return array
   *   The structured array ready to be rendered.
   */
  public function viewMultiple(array $ids)
  {
    dpm('viewMultiple');
  }

  /**
   * View an item from the data source.
   *
   * @param mixed $id
   *   The unique ID for the item.
   *
   * @return array
   *   The structured array ready to be rendered for the current item.
   */
  public function view($id)
  {
    dpm('view');
  }

  /**
   * Update an item based on the request object.
   *
   * @param mixed $id
   *   The unique ID for the item.
   * @param boolean $full_replace
   *   TRUE if the data on the request represents the new object to replace the
   *   existing one. FALSE if the request only contains the bits that need
   *   updating.
   *
   * @return array
   *   The structured array for the item ready to be rendered.
   */
  public function update($id, $full_replace = FALSE)
  {
    dpm('update');
  }

  /**
   * Create an item from the request object.
   *
   * @return array
   *   The structured array for the item ready to be rendered.
   */
  public function create()
  {
    dpm('create');
  }

  /**
   * Remove the item from the data source.
   *
   * @param mixed $id
   *   The unique ID for the item.
   */
  public function remove($id)
  {
    dpm('remove');
  }

}
