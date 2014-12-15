<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermMeterCategory.
 */

class NegawattMessageAnomalousConsumption extends \RestfulEntityBase {

  /**
   * {@inheritdoc}
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Remove not necessary fields.
    unset($public_fields['label']);

    $public_fields['timestamp'] = array(
      'property' => 'timestamp'
    );

    // Message text, after placeholder replacement
    $public_fields['text'] = array(
      'property' => 'text',
      'callbacks' => array(
        array($this, 'getText'),
      ),
    );

    // Node Id of meter.
    $public_fields['meter'] = array(
      'property' => 'field_meter',
      'resource' => array(
        'satec_meter' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
        'iec_meter' => array(
          'name' => 'meters',
          'full_view' => FALSE,
        ),
      ),
    );

    return $public_fields;
  }

  /**
   * Return message text.
   *
   * @param $id
   *  Message Id.
   *
   * @return string
   *  Message string after placeholder replacement.
   */
  protected function getText($id) {
    $message = message_load($id);
    return $message->getText();
  }
}
