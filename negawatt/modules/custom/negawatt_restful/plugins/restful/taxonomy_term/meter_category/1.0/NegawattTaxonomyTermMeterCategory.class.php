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
    $tree = taxonomy_get_tree($vocabulary->vid, $wrapper->getIdentifier(), 1);

    // Exit if there is not children.
    if (empty($tree)) {
      return;
    }

    $children = array();

    // Get just an array of id.
    foreach ($tree as $term) {
      $children[] = $term->tid;
    }

    return $children;
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
}
