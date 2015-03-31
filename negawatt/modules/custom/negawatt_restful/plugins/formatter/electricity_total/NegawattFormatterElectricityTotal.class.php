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
    if (!empty($filter['timestamp']) && !empty($filter['timestamp']['operator']) && $filter['timestamp']['operator'] == 'BETWEEN') {
      $query->condition('e.timestamp', $filter['timestamp']['value'][0], '>=');
      $query->condition('e.timestamp', $filter['timestamp']['value'][1], '<');
      unset($filter['timestamp']);
    }

    // Make sure we handled all the filter fields.
    if (!empty($filter)) {
      throw new \Exception('Unknown fields in filter: ' . implode(', ', array_keys($filter)));
    }

    // Add expressions for electricity min and max timestamps.
    $query->addExpression('SUM(e.sum_kwh)', 'sum');

    $result = $query->execute()->fetchObject();

    // Add total section to output.
    $output['total']['sum_kwh'] = $result->sum;

    return $output;
  }
}
