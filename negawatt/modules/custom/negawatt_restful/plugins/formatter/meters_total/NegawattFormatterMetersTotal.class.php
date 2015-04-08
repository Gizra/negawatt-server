<?php
/**
 * @file
 * Contains NegawattFormatterMetersTotal.
 */
class NegawattFormatterMetersTotal extends \RestfulFormatterJson {
  /**
   * {@inheritdoc}
   *
   * Add 'total' section to meters' output.
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

    // Prepare a min/max query.
    $request = $this->handler->getRequest();
    $filter = $request['filter'];
    unset($filter['has_electricity']);

    $query = db_select('negawatt_electricity_normalized', 'e');

    // Handle 'account' filter (if exists)
    if (!empty($filter['account'])) {
      // Add condition - the OG membership of the meter-node is equal to the
      // account id in the request.
      $query->join('node', 'n', 'n.nid = e.meter_nid');
      $query->join('og_membership', 'og', 'og.etid = n.nid');
      $query->condition('og.entity_type', 'node');
      $query->condition('og.gid', $filter['account']);
      unset($filter['account']);
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
    $output['total']['electricity_time_interval']['min'] = $result->min;
    $output['total']['electricity_time_interval']['max'] = $result->max;

    return $output;
  }
}
