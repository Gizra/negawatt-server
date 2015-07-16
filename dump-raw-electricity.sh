#!/bin/bash

# Dump raw electricity data.
# Change meter_nid col by meter_name

mysql -e "SELECT meter_type, timestamp, rate_type, frequency, node.title AS node_title, kwh, power_factor, kwh_l1, kwh_l2, kwh_l3, power_factor_l1, power_factor_l2, power_factor_l3
    FROM negawatt_electricity AS el, node
    WHERE node.nid = el.meter_nid" --user=root --password=root --batch negawatt \
    | sed 's/\t/,/g' \
    > electricity_raw.csv
