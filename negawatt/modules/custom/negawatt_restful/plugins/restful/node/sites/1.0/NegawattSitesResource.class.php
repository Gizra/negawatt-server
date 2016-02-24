<?php

/**
 * @file
 * Contains NegawattSitesResource.
 */
class NegawattSitesResource extends \NegawattEntityBaseNode {

  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

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

    $public_fields['site_category'] = array(
      'property' => 'field_site_category',
      'resource' => array(
        'site_category' => array(
          'name' => 'site_categories',
          'full_view' => FALSE,
        ),
      ),
    );

    $public_fields['image'] = array(
      'property' => 'field_image',
      'process_callbacks' => array(
        array($this, 'siteImage'),
      ),
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

    $public_fields['meters'] = array(
      'property' => 'nid',
      'process_callbacks' => array(
        array($this, 'siteMeters'),
      ),
    );

    $public_fields['sensors'] = array(
      'property' => 'nid',
      'process_callbacks' => array(
        array($this, 'siteSensors'),
      ),
    );

    return $public_fields;
  }

  /**
   * Process callback, that returns thumbnail url for image.
   *
   * @param $value
   *   Image file info record.
   *
   * @return array
   *   Thumbnail url for the image.
   */
  protected function siteImage($value) {
    if (empty($value)) {
      return NULL;
    }

    $uri = $value[0]['uri'];
    $thumb_url = image_style_url('thumbnail_rotate', $uri);

    return array('url' => $thumb_url);
  }

  /**
   * Process callback, that returns list of meters linked to the site.
   *
   * @param id $value
   *   The site ID.
   *
   * @return array
   *   List of meter ids.
   */
  protected function siteMeters($value)
  {
    return $this->siteLinkedEntities($value, array('iec_meter', 'modbus_meter'));
  }

  /**
   * Process callback, that returns list of sensors linked to the site.
   *
   * @param id $value
   *   The site ID.
   *
   * @return array
   *   List of sensor ids.
   */
  protected function siteSensors($value)
  {
    return $this->siteLinkedEntities($value, array('sensor'));
  }

  /**
   * Helper funciton that returns list of node entities linked to the site.
   *
   * @param int $site_id
   *   The site ID.
   * @param array $node_types
   *   An array of node types (bundles).
   *
   * @return array
   *   List of node ids.
   */
  protected function siteLinkedEntities($site_id, $node_types) {
    // Query for meters belonging to the site.
    $query = new EntityFieldQuery();

    $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', $node_types, 'IN')
      ->fieldCondition('field_meter_site', 'target_id', $site_id);

    $result = $query->execute();

    // Check for no data.
    if (empty($result['node'])) {
      return array();
    }

    // Return array of node ids.
    return array_keys($result['node']);
  }
}
