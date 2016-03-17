<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermNormalizationFactor.
 */

class NegawattTaxonomyTermNormalizationFactor extends \RestfulEntityBaseTaxonomyTerm {
  /**
   * {@inheritdoc}
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['units'] = array(
      'property' => 'field_units',
    );

    return $public_fields;
  }
}
