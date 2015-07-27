<?php

/**
 * @file
 * Contains NegawattModbusMeterResource.
 */
class NegawattEntityMeterBase extends \NegawattEntityBaseNode {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  // Allow reading 200 meters at a time
  protected $range = 200;

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['type'] = array(
      'property' => 'type',
    );

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

    $public_fields['image'] = array(
      'property' => 'field_image',
      'process_callbacks' => array(
        array($this, 'meterImage'),
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

    $public_fields['meter_processed'] = array(
      'property' => 'field_meter_processed',
    );

    $public_fields['last_processed'] = array(
      'property' => 'field_last_processed',
    );

    $public_fields['max_frequency'] = array(
      'property' => 'field_max_frequency',
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
  protected function meterImage($value) {
    if (empty($value)) {
      return NULL;
    }

    $uri = $value[0]['uri'];
    $thumb_url = image_style_url('thumbnail_rotate', $uri);

    return array('url' => $thumb_url);
  }
}
