<?php

/**
 * @file
 * Contains NegawattSatecMeterResource.
 */
class NegawattEntityMeterBase extends \NegawattEntityBaseNode {
  /**
   * Overrides \NegawattEntityBaseNode::publicFieldsInfo().
   */

  // Allow reading 100 meters at a time
  protected $range = 100;

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

    $public_fields['electricity_time_interval'] = array(
      'callback' => array($this, 'electricityMinMax'),
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
   * Callback function to calculate the min and max timestamps of normalized-
   * electricity data related to the meter.
   *
   * @param $wrapper
   *   A wrapper to the meter object.
   *
   * @return array
   *   {
   *    min: min timestamp,
   *    max: max timestmp
   *   }
   *  If no electricity data is found, return false.
   */
  protected function electricityMinMax($wrapper) {
    // Find normalized-electricity entities that are related to this meter
    // min and max timestamps
    $query = db_select('negawatt_electricity_normalized', 'e');

    // Find only electricity entities which are related to this node
    $query->condition('e.meter_nid', $wrapper->getIdentifier());

    // Add a query for electricity min and max timestamps
    $query->addExpression('MIN(e.timestamp)', 'min');
    $query->addExpression('MAX(e.timestamp)', 'max');

    // Set grouping.
    $query->groupBy('e.meter_nid');

    return $query->execute()->fetchObject();
  }

  /**
   * Process callback, That look all the parent of the categories Id of the
   * meter.
   *
   * @param id $value
   *   The meter ID.
   *
   * @return array
   *   A categories id array.
   */
  protected function meterCategories($value) {
    $wrapper = entity_metadata_wrapper('node', $value);
    $meter_categories = $wrapper->{OG_VOCAB_FIELD}->value();
    // Loop for meter-category vocabularies only
    $category_ids = array();
    foreach ($meter_categories as $meter_category) {
      if (strpos($meter_category->vocabulary_machine_name, 'meter_category_') === FALSE) {
        // Not a meter category vocabulary, skip.
        continue;
      }
      $categories = taxonomy_get_parents_all($meter_category->tid);
      foreach ($categories as $category) {
        $wrapper_category = entity_metadata_wrapper('taxonomy_term', $category);
        $category_ids[$wrapper_category->tid->value()] = array(
          "id" => $wrapper_category->tid->value(),
          "name" => $wrapper_category->field_icon_categories->value(),
        );
      }
    }

    return $category_ids;
  }
}
