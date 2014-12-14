<?php

/**
 * @file
 * Contains NegawattAccountsResource.
 */
class NegawattAccountsResource extends \NegawattEntityBaseNode {

  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['location'] = array(
      'property' => 'field_location',
      'process_callbacks' => array(
        array($this, 'processLocation'),
      ),
    );

    $public_fields['type'] = array(
      'property' => 'field_account_type',
    );

    $public_fields['zoom'] = array(
      'property' => 'field_geo_zoom',
    );

    $public_fields['logo'] = array(
      'property' => 'field_logo',
      'process_callbacks' => array(
        array($this, 'imageProcess'),
      ),
      'image_styles' => array('thumbnail', 'medium', 'large'),
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

  /**
   * Location process callback.
   *
   * @param $value
   *
   * @return array
   */
  protected function processLocation($value) {
    return array(
      'lat' => $value['lat'],
      'lng' => $value['lng'],
    );
  }

  /**
     * Process callback, Remove Drupal specific items from the image array.
     *
     * @param array $value
     *   The image array.
     *
     * @return array
     *   A cleaned image array.
     */
    protected function imageProcess($value) {
      if (static::isArrayNumeric($value)) {
        $output = array();
        foreach ($value as $item) {
          $output[] = $this->imageProcess($item);
        }
        return $output;
      }
      return array(
        'id' => $value['fid'],
        'self' => file_create_url($value['uri']),
        'filemime' => $value['filemime'],
        'filesize' => $value['filesize'],
        'width' => $value['width'],
        'height' => $value['height'],
        'styles' => $value['image_styles'],
      );
    }

}
