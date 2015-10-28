<?php

$plugin = array(
  'label' => t('Notifications'),
  'description' => t('List of notifications.'),
  'resource' => 'notifications',
  'class' => 'NegawattNotificationResource',
  'name' => 'notification__1_0',
  'entity_type' => 'message',
  'bundles' => array(
    'demand_exceeds_cap' => 'demand_exceeds_cap',
    'demand_deviate' => 'demand_deviate',
  ),
  'authentication_types' => TRUE,
);
