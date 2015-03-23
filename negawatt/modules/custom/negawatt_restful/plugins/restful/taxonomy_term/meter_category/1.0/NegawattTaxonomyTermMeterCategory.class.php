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

    return $public_fields;
  }

  /**
   *  Get the chidren of the current catetegory item by id.
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

}
