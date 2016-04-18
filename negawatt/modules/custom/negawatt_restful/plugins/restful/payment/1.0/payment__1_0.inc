<?php

$plugin = array(
  'label' => t('Payment data'),
  'description' => t('Payment data from the contract or meters.'),
  'resource' => 'payment',
  'bundle' => 'payment',
  'class' => 'NegawattPaymentResource',
  'name' => 'payment__1_0',
  'entity_type' => 'payment',
  'authentication_types' => TRUE,
  'data_provider_options' => array(
    'table_name' => 'negawatt_payment_normalized',
    'id_column' => 'id',
  ),
);
