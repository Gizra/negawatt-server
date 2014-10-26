<?php

$plugin = array(
  'label' => t('Electricity raw data Validator'),
  'description' => t('Validate the electricity raw content type.'),
  'entity_type' => 'electricity_raw',
  'bundle' => 'electricity_raw',
  'class' => 'NegawattElectricityRawValidator',
);
