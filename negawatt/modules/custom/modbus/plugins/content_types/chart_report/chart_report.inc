<?php

/**
 * Plugin definition.
 */
$plugin = array(
  'title' => t('Chart reports'),
  'description' => t('Show different chart reports.'),
  'category' => t('Ecocity'),
  'defaults' => array(
    'report_scope' => 'day',
    'type' => 'summary',
    ),
);

/**
 * Render callback, Render the default electric meter on HP..
 */
function modbus_chart_report_content_type_render($subtype, $conf, $args, $context) {
  $module = 'modbus';

  // Add media files.
  drupal_add_css(drupal_get_path('module', $module) . '/plugins/content_types/' . $subtype . '/' . $subtype . '.css.less');

  $output = '';

  // Get last user's reading.
  $block = new stdClass();
  global $user;
  $uid = $user->uid;
  // User admin as default user id to display for anonymous users.
  if (!$user->uid) {
    $uid = 1;
  }

  $last_consumption = _modbus_get_data_from_position('last', modbus_daily_consumptions(time(), $uid));
  // If no result use default uid 1.
  if (!$last_consumption) {
    $uid = 1;
    $last_consumption = _modbus_get_data_from_position('last', modbus_daily_consumptions(time(), $uid));
  }

  if (!isset($last_consumption[1])) {
    $block->title = t('שגיאה', array(), array('language' => 'he'));
    $block->module = $module;
    $block->content = t('שגיאה בקריאת נתונים פנה לשרות לקוחות', array(), array('language' => 'he'));
    return $block;
  }

  $wrapper = entity_metadata_wrapper('user', $uid);
  $monthly_consumption = $last_consumption[1] - $wrapper->field_start_consumption->value();

  // Set average monthly scale.
  $scale = $monthly_consumption / date('j', $last_consumption[0]) * 31;

  $start_date = $wrapper->field_start_date->value();

  $consuption_str =  ' ' . t('@consumption קוט"ש', array('@consumption' =>  $monthly_consumption), array('langcode' => 'he'));
  $title = t('צריכת חשמל מתחילת החודש', array(), array('langcode' => 'he'));
  $title .= t(' @kwh קוט"ש', array('@kwh' => $monthly_consumption), array('langcode' => 'he'));
  $title .= t(' (@price ש"ח) ', array('@price' => ceil($monthly_consumption * 0.5947)), array('langcode' => 'he'));
  $alt_title = t('צריכת חשמל מתאריך @date', array('@date' => date('d/m/y',$start_date)), array('langcode' => 'he'));

  $settings['chart']['gauge'] = array(
    'header' => array(t('חשמל', array(), array('langcode' => 'he'))),
    'rows' => array(array($monthly_consumption, 0)),
    'columns' => array('Consumption'),
    'chartType' => 'Gauge',
    'containerId' =>  'content',
    'options' => array(
      'yellowFrom' => $scale,
      'yellowTo' => $scale * 1.2,
      'redFrom' => $scale * 1.2,
      'redTo' => $scale * 1.3,
      'max' => ceil($scale * 1.3),
    )
  );
  $chart = draw_chart($settings);

  $output = '<div class="summary-chart">';
  $output .= $chart['markup'];
  $output .= '</div>';
  //Draw it.

  $block->title = date('j', $start_date) != '1' ? $alt_title : $title;
  $block->module = $module;
  $block->content = $output;
  return $block;
}

/**
 * Form callback.
 */
function modbus_chart_report_content_type_edit_form($form, &$form_state) {
  // provide a blank form so we have a place to have context setting.
  return $form;
}

function modbus_chart_report_content_type_edit_form_submit($form, &$form_state) {
  // Copy everything from our defaults.
  foreach (array_keys($form_state['plugin']['defaults']) as $key) {
    $form_state['conf'][$key] = $form_state['values'][$key];
  }
}

/**
 * Include mozozoom files
 */
function modbus_chart_report_excanvas_library_include() {
  $excanvas_path = libraries_get_path('excanvas');

  if (!empty($excanvas_path)) {
    drupal_add_js($excanvas_path . '/excanvas.js');
    return TRUE;
  }
  return FALSE;
}
