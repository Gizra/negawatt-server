#!/bin/bash

# mysql can't access files in /var/www
# Copy the file to /tmp and change owner
cp electricity_raw.csv /tmp/
chmod 777 /tmp/electricity_raw.csv
sudo chown mysql:mysql /tmp/electricity_raw.csv

# Read raw electricity data from CSV file.
# Change meter_title col to meter_nid
mysql -e "TRUNCATE negawatt_electricity; \
LOAD DATA INFILE '/tmp/electricity_raw.csv' \
INTO TABLE negawatt_electricity \
FIELDS TERMINATED BY ',' \
IGNORE 1 LINES \
(meter_type, timestamp, rate_type, frequency, @meter_title, kwh, power_factor, kwh_l1, kwh_l2, kwh_l3, power_factor_l1, power_factor_l2, power_factor_l3) \
SET meter_nid = (SELECT nid FROM node WHERE node.title=@meter_title);" --user=root --password=root negawatt

sudo rm /tmp/electricity_raw.csv
