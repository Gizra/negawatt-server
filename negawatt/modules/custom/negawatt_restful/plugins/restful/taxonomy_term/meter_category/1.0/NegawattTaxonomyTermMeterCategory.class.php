<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermMeterCategory.
 */

class NegawattTaxonomyTermMeterCategory extends \RestfulEntityBaseTaxonomyTerm {

  /**
   * {@inheritdoc}
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['children'] = array(
      'callback' => array($this, 'getChildren',)
    );

    $public_fields['icon'] = array(
      'property' => 'field_icon_categories',
    );

    $public_fields['electricity_time_interval'] = array(
      'callback' => array($this, 'electricityMinMax'),
    );

    return $public_fields;
  }

  /**
   *  Get the children of the current category item by id.
   */
  protected function getChildren(\EntityMetadataWrapper $wrapper) {
    $vocabulary = taxonomy_vocabulary_machine_name_load($this->getBundle());
    $children = taxonomy_get_children($wrapper->getIdentifier(), $vocabulary->vid);

    // Exit if there is not children.
    if (empty($children)) {
      return;
    }

    $return = array();

    // Get just an array of id.
    foreach ($children as $term) {
      $return[] = $term->tid;
    }

    return $return;
  }

  /**
   *  Overrides \RestfulEntityBase::getList().
   */
  public function getList() {
    $list = parent::getList();

    $return = array();

    // Select vocabulary related.
    $vocabulary = taxonomy_vocabulary_machine_name_load($this->bundle);

    // Order according the taxonomy order.
    $tree = taxonomy_get_tree($vocabulary->vid);
    foreach ($tree as $term) {
      foreach ($list as $item) {
        if ($item['id'] == $term->tid) {
          // Add extra properties.
          $item['depth'] = $term->depth;
          $return[] = $item;
          break;
        }
      }
    }

    return $return;
  }

  /**
   * {@inheritdoc}
   *
   * Change the bundle on the fly, based on a parameter send in the request.
   */
  public function process($path = '', array $request = array(), $method = \RestfulInterface::GET, $check_rate_limit = TRUE) {
    if (empty($request['account']) || !intval($request['account'])) {
      throw new \RestfulBadRequestException('The "account" parameter is missing for the request, thus the vocabulary cannot be set for the account.');
    }

    // Get the account node.
    $node = node_load($request['account']);
    if (!$node) {
      throw new \RestfulBadRequestException('The "account" parameter is not a node.');
    }
    elseif ($node->type != 'account') {
      throw new \RestfulBadRequestException('The "account" parameter is not a of type "account".');
    }

    // Get an array of OG vocabularies for the account.
    $og_vocabs = og_vocab_relation_get_by_group('node', $node->nid);
    if (empty($og_vocabs)) {
      throw new \RestfulBadRequestException('No vocabulary is given for the specified account.');
    }

    // Get the meter-category taxonomy
    $found = FALSE;
    foreach ($og_vocabs as $og_vocab) {
      $vocabulary = taxonomy_vocabulary_load($og_vocab->vid);
      if (strpos($vocabulary->machine_name, 'meter_category_') === FALSE) {
        // Not a meter-category vocabulary, skip.
        continue;
      }

      $found = TRUE;
      $taxonomy = taxonomy_vocabulary_load($og_vocab->vid);
      $this->bundle = $taxonomy->machine_name;
      // Loop no more.
      break;
    }
    if (!$found) {
      throw new \RestfulBadRequestException('No meter-category vocabulary was found.');
    }

    // Remove account ID from the request because it's not a field in the taxonomy.
    unset($request['account']);

    return parent::process($path, $request, $method, $check_rate_limit);
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

    // First, list all children categories of the category.
    $categories = $this->getChildren($wrapper);
    $categories[] = $wrapper->getIdentifier();

    // Gather the meters related to these categories.
    $meters = array();
    foreach($categories as $category) {
      $meters = array_merge($meters, taxonomy_select_nodes($category));
    }

    if (empty($meters)) {
      return NULL;
    }

    // Query min and max timestamps of the meters.
    $query = db_select('negawatt_electricity_normalized', 'e');

    // Find electricity entities which are related to the relevant meters.
    $query->condition('e.meter_nid', $meters, 'IN');

    // Add a query for electricity min and max timestamps.
    $query->addExpression('MIN(e.timestamp)', 'min');
    $query->addExpression('MAX(e.timestamp)', 'max');

    // Set grouping.
    $query->groupBy('e.meter_nid');

    return $query->execute()->fetchObject();
  }

}
