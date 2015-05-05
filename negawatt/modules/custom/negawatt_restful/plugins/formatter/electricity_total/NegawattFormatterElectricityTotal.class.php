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
   * If no category filter is present, add total for the top level categories.
   * If category filter is present, and there are sub categories, add totals
   * for each of the sub categories.
   * If category filter is present and there are no sub categories, add totals
   * for the meters under the category.
   *
   * The format of the totals section is as follows:
   *
   * total: {
   *   type: "category" | "meter"
   *   values: {
   *     id: value,
   *     ...
   *   }
   * }
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
    $output['summary'] = $this->handler->getValueMetadata('electricity', 'summary');

    return $output;
  }
}
