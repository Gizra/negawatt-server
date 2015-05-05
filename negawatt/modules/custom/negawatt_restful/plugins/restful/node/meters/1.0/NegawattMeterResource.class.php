<?php

/**
 * @file
 * Contains NegawattMeterResource.
 */
class NegawattMeterResource extends \RestfulEntityBaseMultipleBundles {
  // Will automatically redirect Satec meters to NegawattSatecMeterResource.class.php
  // and IEC meters to NegawattIecMeterResource.class.php

  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    // Declare common public fields to all the meters so filtering could work.

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

    $public_fields['account'] = array(
      'property' => OG_AUDIENCE_FIELD,
      'resource' => array(
        'account' => array(
          'name' => 'accounts',
          'full_view' => FALSE,
        ),
      ),
    );

    $public_fields['max_frequency'] = array(
      'property' => 'field_max_frequency',
    );

    $public_fields['has_electricity'] = array(
      'property' => 'field_has_electricity',
    );

    $public_fields['meter_categories'] = array(
      'property' => 'nid',
      'process_callbacks' => array(
        array($this, 'meterCategories'),
      ),
    );

    return $public_fields;
  }

  /**
   * {@inheritdoc}
   *
   * Prepare summary section for the formatter.
   */
  public function getQueryForList() {
    // Handle summary section
    // Pass to the formatter a summary of min and max electricity_time_interval.

    // Prepare summary data for the formatter.
    \NegawattEntityMeterBase::prepareSummary($this);

    return parent::getQueryForList();
  }
}
