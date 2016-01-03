<?php

/**
 * @file
 * Contains NegawattSensorTreeResource.
 */

class NegawattSensorTreeResource extends \RestfulBase implements \RestfulDataProviderInterface {

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
   * Overrides \RestfulBase::controllersInfo().
   *
   * Allow only GET requests.
   */
  public static function controllersInfo() {
    return array(
      '' => array(
        // GET returns a list of entities.
        \RestfulInterface::GET => 'index',
      ),
      '^.*$' => array(
        \RestfulInterface::GET => 'view',
        \RestfulInterface::HEAD => 'view',
      ),
    );
  }

  /**
   * Overrides \RestfulBase::index().
   *
   * Return the tree of categories, sites, meters and sensors as an associative array.
   */
  public function index() {
    // TODO: Check that user permissions are honored.
    // TODO: Implement caching. See 'Beginner's Guide to Caching Data in Drupal 7'.
    // TODO: In the result JSON, 'count' = 0, set it to the correct value.

    // Set $user according to request authentication parameters.
    $this->getAccount();

    // Will be used if has to add separators between meters and sensors.
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

      // Set parent-child relationships.
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
      $image = $node_wrapper->field_image->value();

      if (!$site_category) {
        // something happened and there's no parent, skip site.
        continue;
      }

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
        'image' => empty($image) ? NULL : image_style_url('thumbnail_rotate', $image[0]['uri']),
      );

      // Set parent-child relationships.
      $return['s' . $node->nid]['parent'] = 'c' . $site_category->tid;
      $return['c' . $site_category->tid]['children']['s' . $node->nid] = 's' . $node->nid;
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
      $image = $node_wrapper->field_image->value();

      if (!$meter_site) {
        // something happened and there's no parent, skip meter.
        continue;
      }

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
        'image' => empty($image) ? NULL : image_style_url('thumbnail_rotate', $image[0]['uri']),
      );

      // Set parent-child relationships.
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
      $image = $node_wrapper->field_image->value();

      if (!$sensor_site) {
        // something happened and there's no parent, skip sensor.
        continue;
      }

      $return['r' . $node->nid] = array(
        'id' => 'r' . $node->nid,
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
        'image' => empty($image) ? NULL : image_style_url('thumbnail_rotate', $image[0]['uri']),
      );

      // Set parent-child relationships.
      // Check first if need to add separator element.
      $sites_children = &$return['s' . $sensor_site->vid]['children'];
      // Check that there are children for the sensor's site, and that the id
      // of the last element begins with 'm' (that is, its a meter).
      if (!empty($sites_children) && end($sites_children)['id'][0] == 'm') {
        // Add separator element.
        $return['p' . $separator_last_id] = array(
          'id' => 'p' . $separator_last_id,
          'type' => 'separator',
          'parent' => 's' . $sensor_site->vid,
        );
        $sites_children['p' . $separator_last_id] = 'p' . $separator_last_id;
        $separator_last_id++;
      }
      // Add relationships.
      $return['r' . $node->nid]['parent'] = 's' . $sensor_site->vid;
      $sites_children['r' . $node->nid] = 'r' . $node->nid;
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
          $meter['place_address'] = $item['place_address'];
        }
        if (!$meter['place_locality']) {
          $meter['place_locality'] = $item['place_locality'];
        }
        if (!$meter['location']) {
          $meter['location'] = $item['location'];
          $meter['location_valid'] = $item['location_valid'];
        }
        if (!$meter['image']) {
          $meter['image'] = $item['image'];
        }

        // Shortcut the links.
        unset($category['children'][$item['id']]);
        $category['children'][$meter_id] = $meter_id;
        $meter['parent'] = $category_id;

        // Remove the site element.
        unset($return[$item['id']]);
      }
    }

    // Remove categories with no children.
    // Must loop from the end of the list backwards, so after removing child
    // category, there will be a chance to remove also their parent
    // category.
    $keys = array_keys($return);
    foreach (array_reverse($keys) as $key) {
      $item = $return[$key];
      if ($item['type'] == 'site_category' && empty($item['children'])) {
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
