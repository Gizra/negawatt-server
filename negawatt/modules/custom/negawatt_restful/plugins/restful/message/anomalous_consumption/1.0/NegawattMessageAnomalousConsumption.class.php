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

    // Message short-text, after placeholder replacement
    $public_fields['text'] = array(
      'property' => 'mid',
      'process_callbacks' => array(
        array($this, 'getText'),
      ),
    );

    // Message long-text, after placeholder replacement
    $public_fields['longText'] = array(
      'property' => 'mid',
      'process_callbacks' => array(
        array($this, 'getLongText'),
      ),
    );

    // Node Id of meter.
    $public_fields['meter'] = array(
      'property' => 'field_meter',
      'resource' => array(
        'modbus_meter' => array(
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
   * Return message text of partial 0 (short text).
   *
   * @param $id
   *  Message Id.
   *
   * @return string
   *  Message string after placeholder replacement.
   */
  protected function getText($id) {
    $message = message_load($id);
    return $message->getText(LANGUAGE_NONE, array('partials' => TRUE, 'partial delta' => 0));
  }

  /**
   * Return message text of partial 1 (long description).
   *
   * @param $id
   *  Message Id.
   *
   * @return string
   *  Message string after placeholder replacement.
   */
  protected function getLongText($id) {
    $message = message_load($id);
    return $message->getText(LANGUAGE_NONE, array('partials' => TRUE, 'partial delta' => 1));
  }
}
