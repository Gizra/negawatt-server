<?php
/**
 * @file
 * negawatt_message.features.inc
 */

/**
 * Implements hook_ctools_plugin_api().
 */
function negawatt_message_ctools_plugin_api($module = NULL, $api = NULL) {
  if ($module == "strongarm" && $api == "strongarm") {
    return array("version" => "1");
  }
}

/**
 * Implements hook_default_message_type().
 */
function negawatt_message_default_message_type() {
  $items = array();
  $items['anomalous_consumption'] = entity_import('message_type', '{
    "name" : "anomalous_consumption",
    "description" : "Anomalous Consumption",
    "argument_keys" : [],
    "argument" : [],
    "category" : "message_type",
    "data" : {
      "token options" : { "clear" : 0 },
      "purge" : { "override" : 0, "enabled" : 0, "quota" : "", "days" : "" }
    },
    "language" : "",
    "arguments" : null,
    "message_text" : { "und" : [
        {
          "value" : "Anomalous consumption was detected for meter !meter_url (@location), at: @date, rate: @rate_type, frequency: @frequency. Details: Average consumption at current month (@cur_avg_power) differs by more than 10% from previous month (@prev_avg_power).",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003EAnomalous consumption was detected for meter !meter_url (@location), at: @date, rate: @rate_type, frequency: @frequency. Details: Average consumption at current month (@cur_avg_power) differs by more than 10% from previous month (@prev_avg_power).\\u003C\\/p\\u003E\\n"
        }
      ]
    }
  }');
  $items['normalization_completed'] = entity_import('message_type', '{
    "name" : "normalization_completed",
    "description" : "Normalization Completed",
    "argument_keys" : [],
    "argument" : [],
    "category" : "message_type",
    "data" : {
      "token options" : { "clear" : 0 },
      "purge" : { "override" : 0, "enabled" : 0, "quota" : "", "days" : "" }
    },
    "language" : "",
    "arguments" : null,
    "message_text" : { "und" : [
        {
          "value" : "Normalization completed. Meter: !meter_url, Frequencies: @frequencies, time period: @time_period, rate types: @rate_types. Found @entities entities.",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003ENormalization completed. Meter: !meter_url, Frequencies: @frequencies, time period: @time_period, rate types: @rate_types. Found @entities entities.\\u003C\\/p\\u003E\\n"
        }
      ]
    }
  }');
  return $items;
}
