<?php

/**
 * Plugin definition.
 */
$plugin = array(
  'title' => t('Chart table report'),
  'description' => t('Show power consumption table.'),
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
function modbus_chart_table_report_content_type_render($subtype, $conf, $args, $context) {
  global $user;
  $module = 'modbus';
  // Default user is currently logged in one.
  // Only admins can see everybody's data.
  $output = '';
  if (empty($account) || !user_access('administer members')) {
    $output .= '<div>' . t('Displaying logged in user\'s data.' . '</div>');
    $account = $user;
  }

  // Add media files.
  drupal_add_css(drupal_get_path('module', $module) . '/plugins/content_types/' . $subtype . '/' . $subtype . '.css.less');

  $height = 190;
  $width = 960;
  $output .= modbus_chart_table_report_daily_graph($width, $height, $account);

  $block = new stdClass();
  //$block->title = t('Welcome !');
  $block->module = $module;
  $block->content = $output;

  return $block;
}

/**
 * Init a chart array.
 */
function _modbus_chart_table_report_init_chart($title, $width, $height, $type = CHART_TYPE_LINE) {
  return array(
    '#chart_id' => $title,
    '#title' => chart_title($title, 'cc0000', 15),
    '#type' => $type,
    '#size' => chart_size($width, $height),
  );
}

function modbus_chart_table_report_daily_graph($width, $height, $account) {
  $dates = array(
    time(),
    time() - 60 * 60 * 24,
    time() - 60 * 60 * 24 * 2,
  );
  
  $result = array();
  $columns = array();
  $label = array();
  $data = array();
  $max = 0;
  foreach ($dates as $date) {
    $data[$date] = _modbus_get_from_data(modbus_daily_consumptions($date, $account->uid), 'current');
    $max = $max < count($data[$date]) ? count($data[$date]) : $max;
  }
  
  foreach ($dates as $key => $date) {
      
    //foreach ($data[$i] as $key => $value) {
    for ($j = 0; $j < $max ; $j++) { 
      
      $value = (isset($data[$date][$j])) ? $data[$date][$j] : array('0', '0');
       if ($j % 4 == 0) {
      $result[$key][] = (float) $value[1];
       }
      // Save label for this value, one per hour.
      if ($j % 4 == 0) {
        $label[count($result[$key]) - 1] =  date('G:00', $value[0]);
      }
    }
    $columns[$key] = date('D', $date);
  }

   // Building the rows, array of the data point arrays.

  $settings = array();
  $settings['chart']['chartOne'] = array(  
    'header' => $label,
    'rows' => $result,
    'columns' => $columns,
    'chartType' => 'LineChart',// LineChart, PieChart, ,ColumnChart, ,AreaChart, Gauge, BarChart, etc....
    'containerId' =>  'line_chart',
    'options' => array( // Optionals.
      'curveType' => "function", 
      'forceIFrame' => TRUE, 
      'title' => t('צריכה יומית', array(), array('langcode' => 'he')),
    )   
  );
  
  $chart = draw_chart($settings);

  $output = '<div class="chart-report-wrapper">';
  $output .= $chart['markup'];
  $output .= '</div>';

  return $output;
}

/**
 * Form callback.
 */
function modbus_chart_table_report_content_type_edit_form($form, &$form_state) {
  // provide a blank form so we have a place to have context setting.
  return $form;
}

function modbus_chart_table_report_content_type_edit_form_submit($form, &$form_state) {
  // Copy everything from our defaults.
  foreach (array_keys($form_state['plugin']['defaults']) as $key) {
    $form_state['conf'][$key] = $form_state['values'][$key];
  }
}

/**
 * Include mozozoom files
 */
function modbus_chart_table_report_excanvas_library_include() {
  $excanvas_path = libraries_get_path('excanvas');

  if (!empty($excanvas_path)) {
    drupal_add_js($excanvas_path . '/excanvas.js');
    return TRUE;
  }
  return FALSE;
}
