<?php

$plugin = array(
  'label' => t('IEC Counters'),
  'description' => t('List of counters of iec.'),
  'resource' => 'iec_counters',
  'class' => 'NtIecCounterResource',
  'name' => 'iec_counter__1_0',
  'entity_type' => 'node',
  'bundle' => 'iec_counter',
  'authentication_types' => TRUE,
);
