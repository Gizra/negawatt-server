<?php

/**
 * @file
 * Contains NegawattMeterResource.
 */
class NegawattMeterResource extends \RestfulEntityBaseMultipleBundles {

  /**
   * Overrides \RestfulBase::controllersInfo().
   */
  public static function controllersInfo() {
    return array(
      '' => array(
        // GET returns a list of entities.
        \RestfulInterface::GET => 'getList',
      ),
      '^.*$' => array(
        \RestfulInterface::GET => 'viewEntities',
        \RestfulInterface::HEAD => 'viewEntities',
      ),
    );
  }

  /**
   * {@inheritdoc}
   *
   * Pipe the 'meters' entry point to the relevant meter handler.
   */
  public function viewEntities($ids_string) {
    $ids = array_unique(array_filter(explode(',', $ids_string)));
    $output = array();

    $account = $this->getAccount();

    foreach ($ids as $id) {
      $node = node_load($id);

      if ($node->type == 'iec_meter') {
        $resource = 'iec_meters';
      }
      elseif ($node->type == 'modbus_meter') {
        $resource = 'modbus_meters';
      }

      // The resource, by convention, is the plural form of the content-type
      // (for 'modbus_meter', it'll be 'modbus_meters').
      $resource = $node->type . 's';
      $handler = restful_get_restful_handler($resource);
      // Pipe the account.
      $handler->setAccount($account);

      // Get the meter.
      $output[] = $handler->viewEntity($id);
    }

    // Prepare summary data for the formatter.
    $this->prepareSummary($this);

    return $output;
  }

  // Will automatically redirect Modbus meters to NegawattModbusMeterResource.class.php
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
    // @todo: if merged with NegawattEntityMeterBase::prepareSummary(), here was
    // a condition to take only the meter bundle.

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
      // Add condition - the OG membership of the meter-node is equal to the
      // account id in the request.
      $query->join('field_data_field_contract_id', 'c', 'c.entity_id = e.meter_nid');
      $query->condition('c.field_contract_id_value', $filter['contract']);
      unset($filter['contract']);
    }

    // Make sure we handled all the filter fields.
    if (!empty($filter)) {
      throw new \Exception('Unknown fields in filter: ' . implode(', ', array_keys($filter)));
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
