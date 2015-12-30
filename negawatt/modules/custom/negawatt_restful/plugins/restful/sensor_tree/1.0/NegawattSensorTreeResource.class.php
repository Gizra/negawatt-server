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
    // Get vocabulary.
    $vocabulary = taxonomy_vocabulary_machine_name_load('site_category');

    // Get tree of site-categories.
    $taxonomy_tree = taxonomy_get_tree($vocabulary->vid, 0, NULL, TRUE);

    // Build an array of objects to hold required data.
    $return = array();
    foreach ($taxonomy_tree as $category) {
      $category_wrapper = entity_metadata_wrapper('taxonomy_term', $category->tid);

      $return['c' . $category->tid] = array(
        'id' => 'c' . $category->tid,
        'type' => 'site_category',
        'name' => $category->name,
        'description' => $category->description,
        'color' => $category_wrapper->field_color->value(),
        'icon' => $category_wrapper->field_icon_categories->value(),
        'match_strings' => $category_wrapper->field_match_strings->value(),
      );

      // Fix parent-child relashinship.
      if (($parent = $category->parents[0]) != 0) {
        $return[$category->tid]['parent'] = 'c' . $parent;
        $return[$parent]['children'][$category->tid] = 'c' . $category->tid;
      }
    }

    // Clear taxonomy-tree memory
    unset($taxonomy_tree);

    // Add all meters to the list.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', array('iec_meter', 'modbus_meter'))
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $this->request['account'])
      ->execute();

    foreach ($result['node'] as $node) {
      $node_wrapper = entity_metadata_wrapper('node', $node->nid);

      $location = $node_wrapper->field_location->value();

      $return['m' . $node->nid] = array(
        'id' => 'm' . $node->nid,
        'type' => 'meter', //$node->type,
        'name' => $node_wrapper->label(),
        'meter_type' => $node->type,
        'account' => $this->request['account'],
        'meter_site' => $node_wrapper->field_meter_site->value()->vid,
        'location' => array(
          'lat' => $location['lat'],
          'lng' => $location['lng'],
          ),
        'location_valid' => $node_wrapper->field_location_valid->value(),
        'meter_category' => $node_wrapper->field_meter_category->value()->tid,
        'category_valid' => $node_wrapper->field_category_valid->value(),
        'place_description' => $node_wrapper->field_place_description->value(),
        'place_address' => $node_wrapper->field_place_address->value(),
        'place_locality' => $node_wrapper->field_place_locality->value(),
        'max_frequency' => $node_wrapper->field_max_frequency->value(),
        'has_electricity' => $node_wrapper->field_has_electricity->value(),
        'image' => $node_wrapper->field_image->value(),
      );

      // Fix parent-child relashinship.
//      if (($parent = $category->parents[0]) != 0) {
//        $return[$category->tid]['parent'] = 'c' . $parent;
//        $return[$parent]['children'][$category->tid] = 'c' . $category->tid;
//      }
    }

    return $return;
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
