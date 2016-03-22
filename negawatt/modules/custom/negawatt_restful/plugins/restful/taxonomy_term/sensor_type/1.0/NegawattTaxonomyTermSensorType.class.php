<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermSensorType.
 */

class NegawattTaxonomyTermSensorType extends \RestfulEntityBaseTaxonomyTerm {

  /**
   * Save the account id from the request.
   *
   * @var int
   *  Account id.
   */
  protected $account_id = NULL;

  /**
   * {@inheritdoc}
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['units'] = array(
      'property' => 'field_units',
    );

    $public_fields['color'] = array(
      'property' => 'field_color',
    );

    return $public_fields;
  }
}
