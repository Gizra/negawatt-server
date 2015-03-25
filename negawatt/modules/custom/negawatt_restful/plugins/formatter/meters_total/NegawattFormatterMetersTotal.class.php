<?php
/**
 * @file
 * Contains NegawattFormatterMetersTotal.
 */
class NegawattFormatterMetersTotal extends \RestfulFormatterHalJson {
  /**
   * {@inheritdoc}
   */
  public function prepare(array $data) {
// If we're returning an error then set the content type to
// 'application/problem+json; charset=utf-8'.
    if (!empty($data['status']) && floor($data['status'] / 100) != 2) {
      $this->contentType = 'application/problem+json; charset=utf-8';
      return $data;
    }
    // Here we get the data after calling the backend storage for the resources.
    $output = parent::prepare($data);

    // Calculate totals for meters.
    $min_ts = $data[0]->electricity_time_interval->min;
    $max_ts = $data[0]->electricity_time_interval->max;

    foreach ($data as $row) {
      $min_ts = min($min_ts ,$row['electricity_time_interval']['min']);
      $max_ts = max($max_ts ,$row['electricity_time_interval']['max']);
    }
    $output['total']['electricity_time_interval']['min'] = $min_ts;
    $output['total']['electricity_time_interval']['max'] = $max_ts;

    return $output;
  }
}