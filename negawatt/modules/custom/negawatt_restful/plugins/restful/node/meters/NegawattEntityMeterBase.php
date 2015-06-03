<?php

/**
 * @file
 * Contains NegawattModbusMeterResource.
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

  /**
   * Prepare data for summary section.
   *
   * Prepare a min and max electricity_time_interval. The summary will be used
   * by the formatter to add a 'summary' section at the end of the RESTFUL reply.
   *
   * @throws RestfulBadRequestException
   *  If an unknown filter field was supplied.
   */
  protected function prepareSummary() {
    // Prepare a min/max query.
    $request = $this->getRequest();
    $filter = empty($request['filter']) ? array() : $request['filter'];
    unset($filter['has_electricity']);

    $query = db_select('negawatt_electricity_normalized', 'e');

    // Make sure we count only nodes of the current bundle.
    $query->join('node', 'n', 'n.nid = e.meter_nid');
    $query->condition('n.type', $this->bundle);

    // Handle 'account' filter (if exists)
    if (!empty($filter['account'])) {
      // Add condition - the OG membership of the meter-node is equal to the
      // account id in the request.
      $query->join('og_membership', 'og', 'og.etid = n.nid');
      $query->condition('og.entity_type', 'node');
      $query->condition('og.gid', $filter['account']);
      unset($filter['account']);
    }

    // Handle 'contract' filter (if exists)
    if (!empty($filter['contract'])) {
      $query->join('field_data_field_contract_id', 'c', 'c.entity_id = e.meter_nid');
      $query->condition('c.field_contract_id_value', $filter['contract']);
      unset($filter['contract']);
    }

    // Handle 'max_frequency' filter (if exists)
    if (!empty($filter['max_frequency'])) {
      $query->join('field_data_field_max_frequency', 'f', 'f.entity_id = e.meter_nid');
      $query->condition('f.field_max_frequency_value', $filter['max_frequency']);
      unset($filter['max_frequency']);
    }

    // Handle 'label' filter (if exists)
    if (!empty($filter['label'])) {
      $query->join('node', 'n', 'n.nid = e.meter_nid');
      $query->condition('n.title', $filter['label']);
      unset($filter['label']);
    }

    // Make sure we handled all the filter fields.
    if (!empty($filter)) {
      throw new \RestfulBadRequestException(format_string('Unknown fields in filter: @fields', array('@fields' => implode(', ', array_keys($filter)))));
    }

    // Add expressions for electricity min and max timestamps.
    $query->addExpression('MIN(e.timestamp)', 'min');
    $query->addExpression('MAX(e.timestamp)', 'max');

    $result =  $query->execute()->fetchObject();

    // Add total section to output.
    $summary['electricity_time_interval']['min'] = $result->min;
    $summary['electricity_time_interval']['max'] = $result->max;

    // Pass info to formatter
    $this->valueMetadata['meter']['summary'] = $summary;
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
    $this->prepareSummary($this);

    return parent::getQueryForList();
  }

}
