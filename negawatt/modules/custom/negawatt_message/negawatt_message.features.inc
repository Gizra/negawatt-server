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
  $items['demand_deviate'] = entity_import('message_type', '{
    "name" : "demand_deviate",
    "description" : "Demand deviate from last year",
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
          "value" : "\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d1!meter_url \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 @date",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003E\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d1!meter_url \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 @date\\u003C\\/p\\u003E\\n"
        },
        {
          "value" : "\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d4\\u05ea\\u05d2\\u05dc\\u05ea\\u05d4 \\u05e2\\u05d1\\u05d5\\u05e8 !meter_url, \\u05d1\\u05ea\\u05d0\\u05e8\\u05d9\\u05da: @date, \\u05ea\\u05e2\\u05e8\\u05d9\\u05e3: @rate_type, \\u05d0\\u05d9\\u05e0\\u05d8\\u05e8\\u05d5\\u05d5\\u05dc \\u05de\\u05d3\\u05d9\\u05d3\\u05d4: @frequency. \\u05e4\\u05d9\\u05e8\\u05d5\\u05d8: \\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d4\\u05de\\u05de\\u05d5\\u05e6\\u05e2\\u05ea \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 (@cur_avg_power) \\u05d2\\u05d1\\u05d5\\u05d4\\u05d4 \\u05d0\\u05d5 \\u05e0\\u05de\\u05d5\\u05db\\u05d4 \\u05d1\\u05d9\\u05d5\\u05ea\\u05e8 \\u05de-10% \\u05de\\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d1\\u05e9\\u05e0\\u05d4 \\u05e9\\u05e2\\u05d1\\u05e8\\u05d4 (@prev_avg_power).",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003E\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d4\\u05ea\\u05d2\\u05dc\\u05ea\\u05d4 \\u05e2\\u05d1\\u05d5\\u05e8 !meter_url, \\u05d1\\u05ea\\u05d0\\u05e8\\u05d9\\u05da: @date, \\u05ea\\u05e2\\u05e8\\u05d9\\u05e3: @rate_type, \\u05d0\\u05d9\\u05e0\\u05d8\\u05e8\\u05d5\\u05d5\\u05dc \\u05de\\u05d3\\u05d9\\u05d3\\u05d4: @frequency. \\u05e4\\u05d9\\u05e8\\u05d5\\u05d8: \\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d4\\u05de\\u05de\\u05d5\\u05e6\\u05e2\\u05ea \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 (@cur_avg_power) \\u05d2\\u05d1\\u05d5\\u05d4\\u05d4 \\u05d0\\u05d5 \\u05e0\\u05de\\u05d5\\u05db\\u05d4 \\u05d1\\u05d9\\u05d5\\u05ea\\u05e8 \\u05de-10% \\u05de\\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d1\\u05e9\\u05e0\\u05d4 \\u05e9\\u05e2\\u05d1\\u05e8\\u05d4 (@prev_avg_power).\\u003C\\/p\\u003E\\n"
        }
      ]
    }
  }');
  $items['demand_exceeds_cap'] = entity_import('message_type', '{
    "name" : "demand_exceeds_cap",
    "description" : "Demand exceeds cap",
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
          "value" : "\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d1!meter_url \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 @date",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003E\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d1!meter_url \\u05d1\\u05d7\\u05d5\\u05d3\\u05e9 @date\\u003C\\/p\\u003E\\n"
        },
        {
          "value" : "\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d4\\u05ea\\u05d2\\u05dc\\u05ea\\u05d4 \\u05e2\\u05d1\\u05d5\\u05e8 !meter_url, \\u05d1\\u05ea\\u05d0\\u05e8\\u05d9\\u05da: @date, \\u05ea\\u05e2\\u05e8\\u05d9\\u05e3: @rate_type, \\u05d0\\u05d9\\u05e0\\u05d8\\u05e8\\u05d5\\u05d5\\u05dc \\u05de\\u05d3\\u05d9\\u05d3\\u05d4: @frequency. \\u05e4\\u05d9\\u05e8\\u05d5\\u05d8: \\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d4\\u05e0\\u05de\\u05d3\\u05d3\\u05ea (@cur_avg_power) \\u05d2\\u05d1\\u05d5\\u05d4\\u05d4 \\u05d9\\u05d5\\u05ea\\u05e8 \\u05de\\u05d4\\u05d2\\u05d1\\u05d5\\u05dc \\u05d4\\u05e2\\u05dc\\u05d9\\u05d5\\u05df \\u05e9\\u05e0\\u05e7\\u05d1\\u05e2 (@cap).",
          "format" : "full_html",
          "safe_value" : "\\u003Cp\\u003E\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d7\\u05e8\\u05d9\\u05d2\\u05d4 \\u05d4\\u05ea\\u05d2\\u05dc\\u05ea\\u05d4 \\u05e2\\u05d1\\u05d5\\u05e8 !meter_url, \\u05d1\\u05ea\\u05d0\\u05e8\\u05d9\\u05da: @date, \\u05ea\\u05e2\\u05e8\\u05d9\\u05e3: @rate_type, \\u05d0\\u05d9\\u05e0\\u05d8\\u05e8\\u05d5\\u05d5\\u05dc \\u05de\\u05d3\\u05d9\\u05d3\\u05d4: @frequency. \\u05e4\\u05d9\\u05e8\\u05d5\\u05d8: \\u05d4\\u05e6\\u05e8\\u05d9\\u05db\\u05d4 \\u05d4\\u05e0\\u05de\\u05d3\\u05d3\\u05ea (@cur_avg_power) \\u05d2\\u05d1\\u05d5\\u05d4\\u05d4 \\u05d9\\u05d5\\u05ea\\u05e8 \\u05de\\u05d4\\u05d2\\u05d1\\u05d5\\u05dc \\u05d4\\u05e2\\u05dc\\u05d9\\u05d5\\u05df \\u05e9\\u05e0\\u05e7\\u05d1\\u05e2 (@cap).\\u003C\\/p\\u003E\\n"
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
