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
    return array();
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
