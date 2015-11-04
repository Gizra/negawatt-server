#!/bin/bash

# Add fictious climate readings to db.

ACCOUNT=7

SERVER=localhost/negawatt-server2/www
#SERVER=dev-negawatt.pantheon.io
DRUSH_SERVER=
#DRUSH_SERVER=@pantheon.negawatt.dev

# Get X-CSRF access-token
#AUTH=$(echo "admin:admin" | base64)
RESULT=$(curl -s --header "Authorization: Basic YWRtaW46YWRtaW4=" http://$SERVER/api/login-token)
XCSRF=$(echo $RESULT | sed 's/{"access_token":"\([^"]*\)".*/\1/')

cd www
    drush cc all
cd -

# Create meter
RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/climate_meters \
    -F "label=טמפרטורה באילת" -F "place_description=אילת" -F "place_locality=אילת" -F "place_address=אילת" \
    -F "account=$ACCOUNT" -F "max_frequency=5" )
#echo $RESULT

METER_ID=$(echo $RESULT | sed 's/.*\[{"id":"\([0-9]*\)".*/\1/')
echo "meter created: $METER_ID"

# Add temperature (raw) readings
BASE_TS=1435698000

for i in $(seq 1 24); do
    TS=$(( $BASE_TS + $i * 21600 ))
    TEMP=$(( 20 + $(shuf -i1-10 -n1) ))
    HUMI=$(( 60 + $(shuf -i1-30 -n1) ))
    echo "ts=$TS, temp=$TEMP, humi=$HUMI"

    RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/climate_raw \
        -F "meter=$METER_ID" -F "temperature=$TEMP" -F "humidity=$HUMI" -F "timestamp=$TS" \
        -F "frequency=5" )
    #echo $RESULT

    TEMP_ID=$(echo $RESULT | sed 's/.*\[{"id":"\([0-9]*\)".*/\1/')
    echo "temperature reading created: $TEMP_ID"
done