<?php

/**
 * Plugin definition.
 */
$plugin = array(
  'title' => t('Chart Monthly report'),
  'description' => t('Show power consumption monthly table.'),
  'category' => t('Ecocity'),
  'defaults' => array(
    'report_scope' => 'day',
    'type' => 'summary',
  ),
  'required context' => new ctools_context_optional(t('User'), 'user'),
);

/**
 * Render callback.
 */
function modbus_chart_monthly_content_type_render($subtype, $conf, $args, $context) {
  global $user;
  $module = 'modbus';
  // Default user is currently logged in one.
  // Only admins can see everybody's data.
  $output = '';
  if (empty($account) || !user_access('administer members')) {
    $output .= '<div>' . t('Displaying logged in user\'s data.') . '</div>';
    $account = $user;
  }

  // Add media files.
  drupal_add_css(drupal_get_path('module', $module) . '/plugins/content_types/' . $subtype . '/' . $subtype . '.css.less');

  $height = 190;
  $width = 960;
  $output .= modbus_chart_monthly_graph($width, $height, $account);

  $block = new stdClass();
  //$block->title = t('Welcome !');
  $block->module = $module;
  $block->content = $output;

  return $block;
}

/**
 * Init a chart array.
 */
function _modbus_chart_monthly_init_chart($title, $width, $height, $type = CHART_TYPE_LINE) {
  return array(
    '#chart_id' => $title,
    '#title' => chart_title($title, 'cc0000', 15),
    '#type' => $type,
    '#size' => chart_size($width, $height),
  );
}

function modbus_chart_monthly_graph($width, $height, $account) {
  $month = 6;
  $year = 2012;
  $days_in_month = cal_days_in_month(CAL_GREGORIAN, $month, $year);
  $first_file = modbus_get_first_file_of_month($account->uid, $month, $year);
  $first_day = date('d', $first_file);
  $chart = _modbus_chart_monthly_init_chart(t('צריכה יומית במהלך החודש', array('langcode' => 'he')), $width, $height);
  $data = array();

  for ($day = $first_day; $day <= $days_in_month; $day++) {
    $timestamp = ($day - $first_day) * TIME_SECONDS_PER_DAY + $first_file;
    $day_data = _modbus_get_data_from_position('first', modbus_daily_consumptions($timestamp, $account->uid));
    $next_day_data = _modbus_get_data_from_position('first', modbus_daily_consumptions($timestamp + TIME_SECONDS_PER_DAY, $account->uid));
    if ($day_data && $next_day_data) {
      // Calculate difference.
      // Make sure it's over 0 - causes error when generating table.
      $difference = $next_day_data[1] - $day_data[1];
      $day_data[1] = $difference > 0 ? $difference : 0;
      $data[] = $day_data;
    }
    else {
      if (!$day_data && !$next_day_data) {
        break;
      }
    }
  }

  if (!$data) {
    return t('No data for this month.');
  }
  foreach ($data as $key => $value) {
    $result['month'][$value[0]] = $value[1];
    // Save label for this value, one per hour.
    $label[$value[0]] = chart_mixed_axis_label(date('j', $value[0]));
  }

  // Labels -------------
  $chart['#mixed_axis_labels'][CHART_AXIS_Y_LEFT][1][] = chart_mixed_axis_label(t('KW/H'), 1);
  $chart['#mixed_axis_labels'][CHART_AXIS_X_BOTTOM][1] = $label;
  $chart['#mixed_axis_labels'][CHART_AXIS_X_BOTTOM][2][] = chart_mixed_axis_label(t('Time'), 10);


  // Y axes labels.
  $max = max($result['month']);
  $min = min($result['month']) - 5;
  $chart['#mixed_axis_labels'][CHART_AXIS_Y_LEFT][0][] = chart_mixed_axis_range_label($min, $max);

  // Scale. Format: array(min, max).
  $chart['#scale'] = array(0, $max);

  // Summary.
  $chart['#data']['month'] = $result['month'];
  //$chart['#legends']['daily'] = t('New questions (Total: ') . $result['total']['question_count_all']. ')';
  $chart['#data_colors']['month'] = 'ff00000';

  $output = '';
  $output .= '<div class="chart-report-wrapper">';
  $output .= theme('chart', array('chart' => $chart));
  $output .= '</div>';

  return $output;
}

/**
 * Form callback.
 */
function modbus_chart_monthly_content_type_edit_form($form, &$form_state) {
  // provide a blank form so we have a place to have context setting.
  return $form;
}

function modbus_chart_monthly_content_type_edit_form_submit($form, &$form_state) {
  // Copy everything from our defaults.
  foreach (array_keys($form_state['plugin']['defaults']) as $key) {
    $form_state['conf'][$key] = $form_state['values'][$key];
  }
}

/**
 * Include mozozoom files
 */
function modbus_chart_monthly_excanvas_library_include() {
  $excanvas_path = libraries_get_path('excanvas');

  if (!empty($excanvas_path)) {
    drupal_add_js($excanvas_path . '/excanvas.js');
    return TRUE;
  }
  return FALSE;
}
