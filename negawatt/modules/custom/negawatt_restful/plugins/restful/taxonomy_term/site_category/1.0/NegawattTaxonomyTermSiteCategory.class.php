<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermSiteCategory.
 */

class NegawattTaxonomyTermSiteCategory extends \RestfulEntityBaseTaxonomyTerm {

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
   * Callback function to calculate the min and max timestamps of normalized-
   * electricity data related to the site.
   *
   * @param $wrapper
   *   A wrapper to the site object.
   *
   * @return array
   *   {
   *    min: min timestamp,
   *    max: max timestmp
   *   }
   *  If no electricity data is found, return false.
   */
  protected function electricityMinMax($wrapper) {
    // Find normalized-electricity entities that are related to this site
    // min and max timestamps

    // First, list all children categories of the category.
    $categories = $this->getChildren($wrapper);
    $categories[] = $wrapper->getIdentifier();

    // Gather the sites related to these categories.
    $sites = array();
    foreach($categories as $category) {
      $sites = array_merge($sites, taxonomy_select_nodes($category));
    }

    if (empty($sites)) {
      return NULL;
    }

    // Find electricity entities which are related to the relevant sites.
    $query->condition('e.site_nid', $sites, 'IN');

    // Add a query for electricity min and max timestamps.
    $query->addExpression('MIN(e.timestamp)', 'min');
    $query->addExpression('MAX(e.timestamp)', 'max');

    // Set grouping.
    $query->groupBy('e.site_nid');

    return $query->execute()->fetchObject();
  }

}
