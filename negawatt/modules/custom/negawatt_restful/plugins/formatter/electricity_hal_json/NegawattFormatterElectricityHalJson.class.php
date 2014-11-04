<?php

/**
 * @file
 * Contains NegawattFormatterElectricityHalJson.
 */

class NegawattFormatterElectricityHalJson extends \RestfulFormatterHalJson {
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

    // Calculate monthly totals for each meter.
    $actualMeterId;
    foreach ($data as $row) {
      if (empty($month) || $month > 12) {
        $month = 1;
      }

      if ($actualMeterId !== $row['meter']->nid) {
        $actualMeterId = $row['meter']->nid;
      }

      $output['total'][$month]['kwh'] += $row['kwh'];
      $month++;
    }

    return $output;
  }
}

