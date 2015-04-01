<?php
/**
 * @file
 * Contains NegawattFormatterElectricityTotal.
 */
class NegawattFormatterElectricityTotal extends \RestfulFormatterJson {
  /**
   * {@inheritdoc}
   *
   * Add 'total' section to electricity output.
   */
  public function prepare(array $data) {
    // If we're returning an error then set the content type to
    // 'application/problem+json; charset=utf-8'.
    if (!empty($data['status']) && floor($data['status'] / 100) != 2) {
      $this->contentType = 'application/problem+json; charset=utf-8';
      return $data;
    }

    // Let parent formatter prepare the output.
    $output = parent::prepare($data);

    // Prepare a sum query.
    $request = $this->handler->getRequest();
    $filter = $request['filter'];

    $query = db_select('negawatt_electricity_normalized', 'e');

    // Handle 'account' filter (if exists)
    if (!empty($filter['meter_account'])) {
      // Add condition - the OG membership of the meter-node is equal to the
      // account id in the request.
      $query->join('node', 'n', 'n.nid = e.meter_nid');
      $query->join('og_membership', 'og', 'og.etid = n.nid');
      $query->condition('og.entity_type', 'node');
      $query->condition('og.gid', $filter['meter_account']);
      unset($filter['meter_account']);
    }

    // Handle 'type' filter
    if (!empty($filter['type'])) {
      $query->condition('e.type', $filter['type']);
      unset($filter['type']);
    }

    // Handle 'timestamp' filter
    // Make sure it's a 'BETWEEN' filter
    if (!empty($filter['timestamp']) && !empty($filter['timestamp']['operator']) && $filter['timestamp']['operator'] == 'BETWEEN') {
      $query->condition('e.timestamp', $filter['timestamp']['value'][0], '>=');
      $query->condition('e.timestamp', $filter['timestamp']['value'][1], '<');
      unset($filter['timestamp']);
    }

    // Handle meter categories.
    // If none given, take 0 (root) as default.
    $parent_category = !empty($filter['meter_category']) ? $filter['meter_category'] : 0;
    $child_categories = array_keys(taxonomy_get_children($parent_category));
    $query->join('field_data_og_vocabulary', 'cat', 'cat.entity_id = e.meter_nid');
    $query->condition('cat.og_vocabulary_target_id', $child_categories, 'IN');
    $query->join('taxonomy_term_data', 'tax', 'tax.tid = cat.og_vocabulary_target_id');
    $query->fields('tax', array('name'));
    $query->groupBy('cat.og_vocabulary_target_id');
    unset($filter['meter_category']);

    // Make sure we handled all the filter fields.
    if (!empty($filter)) {
      throw new \Exception('Unknown fields in filter: ' . implode(', ', array_keys($filter)));
    }

    // Add expressions for electricity min and max timestamps.
    $query->addExpression('SUM(e.sum_kwh)', 'sum');

    $result = $query->execute()->fetchAllKeyed();

    // Add total section to output.
    $output['total'] = $result;

    return $output;
  }
}
