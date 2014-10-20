<?php

$plugin = array(
  'label' => t('IEC Meter Validator'),
  'description' => t('Validate the iec meter content type.'),
  'entity_type' => 'node',
  'bundle' => 'iec_meter',
  'class' => 'NegawattIecMeterValidator',
);
