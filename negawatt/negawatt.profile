<?php
/**
 * @file
 * negawatt profile.
 */

/**
 * Implements hook_form_FORM_ID_alter().
 *
 * Allows the profile to alter the site configuration form.
 */
function negawatt_form_install_configure_form_alter(&$form, $form_state) {
  // Pre-populate the site name with the server name.
  $form['site_information']['site_name']['#default_value'] = 'CMS negawatt';
}

/**
 * Implements hook_install_tasks().
 */
function negawatt_install_tasks() {
  $tasks = array();

  $tasks['negawatt_create_roles'] = array(
    'display_name' => st('Create user roles'),
    'display' => FALSE,
  );

  $tasks['negawatt_set_permissions'] = array(
    'display_name' => st('Set Permissions'),
    'display' => FALSE,
  );

  $tasks['negawatt_set_variables'] = array(
    'display_name' => st('Set Variables'),
    'display' => FALSE,
  );

  return $tasks;
}

/**
 * Task callback; Create user roles.
 */
function negawatt_create_roles() {
  // Create a default role for site administrators, with all available
  // permissions assigned.
  $role = new stdClass();
  $role->name = 'administrator';
  $role->weight = 2;
  user_role_save($role);
  user_role_grant_permissions($role->rid, array_keys(module_invoke_all('permission')));
  // Set this as the administrator role.
  variable_set('user_admin_role', $role->rid);
  // Assign user 1 the "administrator" role.
  db_insert('users_roles')
    ->fields(array('uid' => 1, 'rid' => $role->rid))
    ->execute();

  // Create a role for restws.
  $role = new stdClass();
  $role->name = 'client';
  $role->weight = 3;
  user_role_save($role);
}

/**
 * Task callback; Set permissions.
 */
function negawatt_set_permissions() {
  // Enable default permissions for system roles.
  $permissions = array(
    'access content',
    'search content',
    'access site-wide contact form',
  );

  user_role_grant_permissions(DRUPAL_ANONYMOUS_RID, $permissions);
  user_role_grant_permissions(DRUPAL_AUTHENTICATED_RID, $permissions);

  // Enable permissions for restws.
  $permissions = array(
    'access resource user',
    'administer users',
    'access user profiles',
  );

  $role = user_role_load_by_name('client');

  user_role_grant_permissions($role->rid, $permissions);
}

/**
 * Task callback; Set variables.
 */
function negawatt_set_variables() {
  $variables = array(
    'admin_theme' => 'seven',
    'node_admin_theme' => 0,
    'jquery_update_jquery_version' => '1.8',
  );s

  foreach ($variables as $key => $value) {
    variable_set($key, $value);
  }
}
