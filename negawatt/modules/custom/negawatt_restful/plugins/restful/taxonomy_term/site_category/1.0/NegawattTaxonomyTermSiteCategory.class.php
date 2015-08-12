<?php

/**
 * @file
 * Contains \NegawattTaxonomyTermSiteCategory.
 */

class NegawattTaxonomyTermSiteCategory extends \RestfulEntityBaseTaxonomyTerm {

  /**
   * Save the account id from the request.
   *
   * @var int
   *  Account id.
   */
  protected $account_id = NULL;

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

    $public_fields['color'] = array(
      'property' => 'field_color',
    );

    $public_fields['sites'] = array(
      'callback' => array($this, 'categorySites'),
    );

    $public_fields['electricity_time_interval'] = array(
      'callback' => array($this, 'electricityMinMax'),
    );

    return $public_fields;
  }

  /**
   *  Get the first-level children of the current category item by id.
   */
  protected function getChildren(\EntityMetadataWrapper $wrapper) {
    $vocabulary = taxonomy_vocabulary_machine_name_load($this->getBundle());
    $children = taxonomy_get_children($wrapper->getIdentifier(), $vocabulary->vid);

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
   * Verify the account parameter of the request and save account-id.
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

    // Save account id.
    $this->account_id = $request['account'];

    // Remove account ID from the request because it's not a field in the taxonomy.
    unset($request['account']);
    return parent::process($path, $request, $method, $check_rate_limit);
  }

  /**
   * Callback function to get all the sites that correspond directly to the given category.
   *
   * @param $wrapper
   *   A wrapper to the site-category object.
   *
   * @return array
   *   List of sites that relate directly to the category.
   */
  protected function categorySites($wrapper) {
    // Look for all the sites that are connected to this category, and of relevant account.
    $query = new EntityFieldQuery();

    $query->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', 'meter_site')
      ->propertyCondition('status', NODE_PUBLISHED)
      ->fieldCondition('field_site_category', 'target_id', $wrapper->getIdentifier())
      ->fieldCondition(OG_AUDIENCE_FIELD, 'target_id', $this->account_id);

    $result = $query->execute();

    if (empty($result['node'])) {
      return array();
    }

    return array_keys($result['node']);
  }

  /**
   * Callback function to calculate the min and max timestamps of normalized-
   * electricity data related to the category.
   *
   * The calculation is done ALL THE WAY down the cetegories tree.
   *
   * @param $wrapper
   *   A wrapper to the site-category object.
   *
   * @return array
   *   Array with the following keys:
   *    - min: min timestamp for electricity related to the meters in the category.
   *    - max: max timestmp for electricity related to the meters in the category.
   *
   *  If no electricity data is found, return NULL.
   */
  protected function electricityMinMax($wrapper) {
    // Find normalized-electricity entities that are related to this site
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

    // Gather the sites related to these categories.
    $sites = array();
    foreach($categories as $category) {
      $wrapper = entity_metadata_wrapper('taxonomy_term', $category);
      $sites = array_merge($sites, $this->categorySites($wrapper));
    }

    if (empty($sites)) {
      return NULL;
    }

    // Get the list of meters in the given sites.
    $query = new EntityFieldQuery();
    $result = $query
      ->entityCondition('entity_type', 'node')
      ->entityCondition('bundle', array('iec_meter', 'modbus_meter'), 'IN')
      ->fieldCondition('field_meter_site', 'target_id', $sites, 'IN')
      ->execute();

    $meters = array_keys($result['node']);

    if (empty($meters)) {
      return NULL;
    }

    // Query min and max timestamps of the meters.
    $query = db_select('negawatt_electricity_normalized', 'e');

    // Find electricity entities which are related to the relevant sites.
    $query->condition('e.meter_nid', $meters, 'IN');

    // Add a query for electricity min and max timestamps.
    $query->addExpression('MIN(e.timestamp)', 'min');
    $query->addExpression('MAX(e.timestamp)', 'max');

    // Set grouping.
    $query->groupBy('e.meter_nid');

    return $query->execute()->fetchObject();
  }
}
