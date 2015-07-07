<?php
/**
 * @file
 * negawatt_message.features.field_instance.inc
 */

/**
 * Implements hook_field_default_field_instances().
 */
function negawatt_message_field_default_field_instances() {
  $field_instances = array();

  // Exported field_instance: 'message-demand_deviate-field_message_place_description'
  $field_instances['message-demand_deviate-field_message_place_description'] = array(
    'bundle' => 'demand_deviate',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => 'The description of the place related to the message. ',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'text',
        'settings' => array(),
        'type' => 'text_default',
        'weight' => 3,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_message_place_description',
    'label' => 'Place description',
    'required' => 0,
    'settings' => array(
      'text_processing' => 0,
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'text',
      'settings' => array(
        'size' => 60,
      ),
      'type' => 'text_textfield',
      'weight' => 2,
    ),
  );

  // Exported field_instance: 'message-demand_deviate-field_meter'
  $field_instances['message-demand_deviate-field_meter'] = array(
    'bundle' => 'demand_deviate',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'entityreference',
        'settings' => array(
          'link' => FALSE,
        ),
        'type' => 'entityreference_label',
        'weight' => 1,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_meter',
    'label' => 'Meter',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'options',
      'settings' => array(),
      'type' => 'options_select',
      'weight' => 0,
    ),
  );

  // Exported field_instance: 'message-demand_deviate-field_meter_account'
  $field_instances['message-demand_deviate-field_meter_account'] = array(
    'bundle' => 'demand_deviate',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'entityreference',
        'settings' => array(
          'link' => FALSE,
        ),
        'type' => 'entityreference_label',
        'weight' => 4,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_meter_account',
    'label' => 'Meter account',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'options',
      'settings' => array(),
      'type' => 'options_select',
      'weight' => 1,
    ),
  );

  // Exported field_instance: 'message-demand_exceeds_cap-field_message_place_description'
  $field_instances['message-demand_exceeds_cap-field_message_place_description'] = array(
    'bundle' => 'demand_exceeds_cap',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => 'The description of the place related to the message. ',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'text',
        'settings' => array(),
        'type' => 'text_default',
        'weight' => 3,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_message_place_description',
    'label' => 'Place description',
    'required' => 0,
    'settings' => array(
      'text_processing' => 0,
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'text',
      'settings' => array(
        'size' => 60,
      ),
      'type' => 'text_textfield',
      'weight' => 2,
    ),
  );

  // Exported field_instance: 'message-demand_exceeds_cap-field_meter'
  $field_instances['message-demand_exceeds_cap-field_meter'] = array(
    'bundle' => 'demand_exceeds_cap',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'entityreference',
        'settings' => array(
          'link' => FALSE,
        ),
        'type' => 'entityreference_label',
        'weight' => 1,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_meter',
    'label' => 'Meter',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'options',
      'settings' => array(),
      'type' => 'options_select',
      'weight' => 0,
    ),
  );

  // Exported field_instance: 'message-demand_exceeds_cap-field_meter_account'
  $field_instances['message-demand_exceeds_cap-field_meter_account'] = array(
    'bundle' => 'demand_exceeds_cap',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'entityreference',
        'settings' => array(
          'link' => FALSE,
        ),
        'type' => 'entityreference_label',
        'weight' => 4,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_meter_account',
    'label' => 'Meter account',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'options',
      'settings' => array(),
      'type' => 'options_select',
      'weight' => 1,
    ),
  );

  // Exported field_instance: 'message-normalization_completed-field_meter'
  $field_instances['message-normalization_completed-field_meter'] = array(
    'bundle' => 'normalization_completed',
    'default_value' => NULL,
    'deleted' => 0,
    'description' => '',
    'display' => array(
      'default' => array(
        'label' => 'above',
        'module' => 'entityreference',
        'settings' => array(
          'link' => FALSE,
        ),
        'type' => 'entityreference_label',
        'weight' => 0,
      ),
      'message_notify_email_body' => array(
        'label' => 'above',
        'settings' => array(),
        'type' => 'hidden',
        'weight' => 0,
      ),
      'message_notify_email_subject' => array(
        'label' => 'above',
        'settings' => array(),
        'type' => 'hidden',
        'weight' => 0,
      ),
    ),
    'entity_type' => 'message',
    'field_name' => 'field_meter',
    'label' => 'Meter',
    'required' => 0,
    'settings' => array(
      'user_register_form' => FALSE,
    ),
    'widget' => array(
      'active' => 1,
      'module' => 'options',
      'settings' => array(),
      'type' => 'options_select',
      'weight' => 1,
    ),
  );

  // Translatables
  // Included for use with string extractors like potx.
  t('Meter');
  t('Meter account');
  t('Place description');
  t('The description of the place related to the message. ');

  return $field_instances;
}
