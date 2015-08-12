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

    $public_fields['meters'] = array(
      'callback' => array($this, 'getMeters',)
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
   *  Get the meters of the current category item by id.
   */
  protected function getMeters(\EntityMetadataWrapper $wrapper) {
    // Get the list of meters in the given site-category.
    return taxonomy_select_nodes($wrapper->getIdentifier(), $pager = FALSE);
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
    // Find normalized-electricity entities that are related to this meter category
    // min and max timestamps

    // First, list all children categories of the category down the taxonomy tree.

    // Select vocabulary related.
    $vocabulary = taxonomy_vocabulary_machine_name_load($this->bundle);

    // Get taxonomy tree from current category, downwards.
    $tree = taxonomy_get_tree($vocabulary->vid, $wrapper->getIdentifier());
    $categories = array();
    foreach ($tree as $term) {
      $categories[] = $term->tid;
    }
    $categories[] = $wrapper->getIdentifier();

    // Gather the meters related to these categories.
    $meters = array();
    foreach($categories as $category) {
      $meters = array_merge($meters, taxonomy_select_nodes($category, $pager = FALSE));
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
