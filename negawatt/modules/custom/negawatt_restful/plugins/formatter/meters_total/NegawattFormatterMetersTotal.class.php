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

    // Get data from resource
    $output['summary'] = $this->handler->getValueMetadata('meter', 'summary');

    return $output;
  }
}
