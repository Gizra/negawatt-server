<?php

/**
 * @file
 * Contains NegawattMeResource.
 */

class NegawattMeResource extends \RestfulEntityBaseUser {

  /**
   * Overrides \RestfulEntityBase::controllers.
   */
  protected $controllers = array(
    '' => array(
      \RestfulInterface::GET => 'viewEntity',
    ),
  );

  /**
   * Overrides \RestfulEntityBase::viewEntity().
   *
   * Always return the current user.
   */
  public function viewEntity($entity_id) {
    $account = $this->getAccount();

    $me = parent::viewEntity($account->uid);
    $me['picture'] = $account->picture ? file_create_url($account->picture->uri) : file_create_url(file_load(variable_get('default_user_picture_fid'))->uri);

    return $me;
  }
}
