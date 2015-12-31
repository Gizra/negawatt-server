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
   * Override RestfulBase::controllersInfo()
   *
   * Returns the default controllers for the entity.
   * Allow only index and view calls.
   *
   * @return array
   *   Nested array that provides information about what method to call for each
   *   route pattern.
   */
  public static function controllersInfo() {
    // Provide sensible defaults for the HTTP methods. These methods (index,
    // create, view, update and delete) are not implemented in this layer but
    // they are guaranteed to exist because we are enforcing that all restful
    // resources are an instance of \RestfulDataProviderInterface.
    return array(
      '' => array(
        // GET returns a list of entities.
        \RestfulInterface::GET => 'index',
        \RestfulInterface::HEAD => 'index',
      ),
      // We don't know what the ID looks like, assume that everything is the ID.
      '^.*$' => array(
        \RestfulInterface::GET => 'view',
        \RestfulInterface::HEAD => 'view',
      ),
    );
  }

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
    // TODO: Check that user permissions are honored.
    // TODO: Implement caching. See 'Begiiner's Guide to Caching Data in Drupal 7'.

    $separator_last_id = 0;

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

      // Fix parent-child relationships.
      if (($parent = $category->parents[0]) != 0) {
        $return['c' . $category->tid]['parent'] = 'c' . $parent;
        $return['c' . $parent]['children']['c' . $category->tid] = 'c' . $category->tid;
      }
    }

    // Clear taxonomy-tree memory
    unset($taxonomy_tree);

    // Add all sites to the list.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'meter_site')
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $this->request['account'])
      ->execute();

    foreach ($result['node'] as $node) {
      $node_wrapper = entity_metadata_wrapper('node', $node->nid);

      $location = $node_wrapper->field_location->value();
      $site_category = $node_wrapper->field_site_category->value();

      $return['s' . $node->nid] = array(
        'id' => 's' . $node->nid,
        'type' => 'site',
        'name' => $node_wrapper->label(),
        'account' => $this->request['account'],
        'location' => empty($location) ? NULL : array(
          'lat' => $location['lat'],
          'lng' => $location['lng'],
        ),
        'location_valid' => $node_wrapper->field_location_valid->value(),
        'site_category' => $site_category ? $site_category->tid : NULL,
        'category_valid' => $node_wrapper->field_category_valid->value(),
        'place_description' => $node_wrapper->field_place_description->value(),
        'place_address' => $node_wrapper->field_place_address->value(),
        'place_locality' => $node_wrapper->field_place_locality->value(),
      );

      // Fix parent-child relationships.
      // FIXME: site category should always be available, remove if...
      if ($site_category) {
        $return['s' . $node->nid]['parent'] = 'c' . $site_category->tid;
        $return['c' . $site_category->tid]['children']['s' . $node->nid] = 's' . $node->nid;
      }
    }

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
      $meter_site = $node_wrapper->field_meter_site->value();
      $meter_category = $node_wrapper->field_meter_category->value();

      $return['m' . $node->nid] = array(
        'id' => 'm' . $node->nid,
        'type' => 'meter',
        'name' => $node_wrapper->label(),
        'meter_type' => $node->type,
        'account' => $this->request['account'],
        'meter_site' => $meter_site->vid,
        'location' => empty($location) ? NULL : array(
          'lat' => $location['lat'],
          'lng' => $location['lng'],
        ),
        'location_valid' => $node_wrapper->field_location_valid->value(),
        'meter_category' => $meter_category ? $meter_category->tid : NULL,
        'category_valid' => $node_wrapper->field_category_valid->value(),
        'place_description' => $node_wrapper->field_place_description->value(),
        'place_address' => $node_wrapper->field_place_address->value(),
        'place_locality' => $node_wrapper->field_place_locality->value(),
        'max_frequency' => $node_wrapper->field_max_frequency->value(),
        'has_electricity' => $node_wrapper->field_has_electricity->value(),
        'image' => $node_wrapper->field_image->value(),
      );

      // Fix parent-child relationships.
      $return['m' . $node->nid]['parent'] = 's' . $meter_site->vid;
      $return['s' . $meter_site->vid]['children']['m' . $node->nid] = 'm' . $node->nid;
    }

    // Add sensors to the list.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'sensor')
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $this->request['account'])
      ->execute();

    foreach ($result['node'] as $node) {
      $node_wrapper = entity_metadata_wrapper('node', $node->nid);

      $location = $node_wrapper->field_location->value();
      $sensor_site = $node_wrapper->field_meter_site->value();

      $return['n' . $node->nid] = array(
        'id' => 'n' . $node->nid,
        'type' => 'sensor',
        'name' => $node_wrapper->label(),
        'sensor_type' => $node_wrapper->field_sensor_type->value()->tid,
        'type_valid' => $node_wrapper->field_type_valid->value(),
        'account' => $this->request['account'],
        'sensor_site' => $sensor_site->vid,
        'location' => empty($location) ? NULL : array(
          'lat' => $location['lat'],
          'lng' => $location['lng'],
        ),
        'location_valid' => $node_wrapper->field_location_valid->value(),
        'place_description' => $node_wrapper->field_place_description->value(),
        'place_address' => $node_wrapper->field_place_address->value(),
        'place_locality' => $node_wrapper->field_place_locality->value(),
        'max_frequency' => $node_wrapper->field_max_frequency->value(),
        'has_data' => $node_wrapper->field_has_data->value(),
        'image' => $node_wrapper->field_image->value(),
      );

      // Fix parent-child relationships.
      // Check first if need to add separator element.
      $sites_children = &$return['s' . $sensor_site->vid]['children'];
      // Check that there are children for the sensor's site, and that the id
      // of the last element begins with 'm' (that is, its a meter).
      if (!empty($sites_children) && end($sites_children)['id'][0] == 'm') {
        // Add separator element.
        $return['p' . $separator_last_id] = array(
          'id' => 'p' . $separator_last_id,
          'type' => 'separator',
        );
        $sites_children['p' . $separator_last_id] = 'p' . $separator_last_id;
        $separator_last_id++;
      }
      // Add relationships.
      $return['n' . $node->nid]['parent'] = 's' . $sensor_site->vid;
      $sites_children['n' . $node->nid] = 'n' . $node->nid;
    }

    // Replace all sites with only one meter by the meter itself.
    foreach ($return as $item) {
      if ($item['type'] == 'site' && sizeof($item['children']) == 1) {
        // A site element with only one child. Make a shortcut between the
        // parent category and child meter.
        $category_id = $item['parent'];
        $meter_id = reset($item['children']); // The first element of the array.
        $category = &$return[$category_id];
        $meter = &$return[$meter_id];

        // Copy fields from site to meter if needed.
        if (!$meter['place_description']) {
          $meter['place_description'] = $item['place_description'];
        }
        if (!$meter['place_address']) {
          $meter['place_description'] = $item['place_address'];
        }
        if (!$meter['place_locality']) {
          $meter['place_description'] = $item['place_locality'];
        }
        if (!$meter['location']) {
          $meter['location'] = $item['location'];
          $meter['location_valid'] = $item['location_valid'];
        }

        // Shortcut the links.
        unset($category['children'][$item['id']]);
        $category['children'][$meter_id] = $meter_id;
        $meter['parent'] = $category_id;

        // Remove the site element.
        unset($return[$item['id']]);
      }
    }

    // Remove categories and sites with no children.
    // Must loop from the end of the list backwards, so after removing child
    // category of site, there will be a chance to remove also their parent
    // category.
    $keys = array_keys($return);
    foreach (array_reverse($keys) as $key) {
      $item = $return[$key];
      if (in_array($item['type'], array('site_category', 'site')) && empty($item['children'])) {
        // Check if has parent.
        $parent = $item['parent'];
        if ($parent) {
          // Erase item's key from list of children of the parent item.
          unset($return[$parent]['children'][$key]);
        }
        // Erase the item itself.
        unset($return[$key]);
      }
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
    // TODO: Implement view?
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
  }

  /**
   * Create an item from the request object.
   *
   * @return array
   *   The structured array for the item ready to be rendered.
   */
  public function create()
  {
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
