<?php

$plugin = array(
  'label' => t('Payment Raw Data'),
  'description' => t('Payment Raw data from the contract or meters.'),
  'resource' => 'payment_raw',
  'bundle' => 'payment_raw',
  'class' => 'NegawattPaymentRawResource',
  'name' => 'payment_raw__1_0',
  'entity_type' => 'payment_raw',
  'authentication_types' => TRUE,
);
