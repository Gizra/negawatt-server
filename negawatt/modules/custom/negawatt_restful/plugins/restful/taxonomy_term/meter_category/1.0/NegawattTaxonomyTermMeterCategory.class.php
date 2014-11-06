<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermMeterCategory.
 */

class NegawattTaxonomyTermMeterCategory extends \RestfulEntityBaseTaxonomyTerm {

  /**
   * {@inheritdoc}
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['parent'] = array(
      'property' => 'parent',
      'resource' => array(
        'meter_category' => array(
          'name' => 'meter_categories',
          'full_view' => FALSE,
        ),
      )
    );

    return $public_fields;

  }
}
