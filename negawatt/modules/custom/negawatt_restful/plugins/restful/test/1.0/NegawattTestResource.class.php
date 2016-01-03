<?php

/**
 * @file
 * Contains NegawattSensorTreeResource.
 */

class NegawattTestResource extends \RestfulBase implements \RestfulDataProviderInterface {

  // Allow reading 200 items at a time
  protected $range = 200;

  /**
   * Overrides \RestfulBase::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields['id'] = array(
      'property' => 'id',
    );

    $public_fields['type'] = array(
      'property' => 'type',
    );

    $public_fields['label'] = array(
      'property' => 'label',
    );

    $public_fields['parent'] = array(
      'property' => 'parent'
    );

    return $public_fields;
  }

  /**
   * Overrides \RestfulBase::controllersInfo().
   *
   * Allow only GET requests.
   */
  public static function controllersInfo() {
    return array(
      '' => array(
        // GET returns a list of entities.
        \RestfulInterface::GET => 'index',
      ),
    );
  }

  /**
   * Get a list of entities.
   *
   * @return array
   *   Array of entities, as passed to RestfulEntityBase::viewEntity().
   *
   * @throws RestfulBadRequestException
   */
  public function index() {
    // TODO: Check that user permissions are honored.
    // TODO: Implement caching. See 'Beginner's Guide to Caching Data in Drupal 7'.
    // TODO: In the result JSON, 'count' = 0, set it to the correct value.

    // Due to problem in authentication using access-token, login admin by force.
    // FIXME: Delete this section after authentication is fixed.
//    if ($uid = user_authenticate('admin', 'admin')) {
//      global $user;
//      $user = user_load($uid);
//      $login_array = array ('name' => 'admin');
//      user_login_finalize($login_array);
//    }

    global $user;
    return (array) $user;
  }

  /**
   * View a collection of items.
   *
   * @param array $ids
   *   An array of items to view.
   *
   * @return array
   *   The structured array ready to be rendered.
   */
  public function viewMultiple(array $ids)
  {
  }

  /**
   * View an item from the data source.
   *
   * @param mixed $id
   *   The unique ID for the item.
   *
   * @return array
   *   The structured array ready to be rendered for the current item.
   */
  public function view($id)
  {
    // TODO: Implement view?
  }

  /**
   * Update an item based on the request object.
   *
   * @param mixed $id
   *   The unique ID for the item.
   * @param boolean $full_replace
   *   TRUE if the data on the request represents the new object to replace the
   *   existing one. FALSE if the request only contains the bits that need
   *   updating.
   *
   * @return array
   *   The structured array for the item ready to be rendered.
   */
  public function update($id, $full_replace = FALSE)
  {
  }

  /**
   * Create an item from the request object.
   *
   * @return array
   *   The structured array for the item ready to be rendered.
   */
  public function create()
  {
  }

  /**
   * Remove the item from the data source.
   *
   * @param mixed $id
   *   The unique ID for the item.
   */
  public function remove($id)
  {
  }

}
