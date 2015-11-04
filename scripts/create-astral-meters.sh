#!/bin/bash

# Create meters from CSV data.

ACCOUNT=2
# Data source table. Every line beginning with '#,' will be read as a CSV meter line.
#--------------------------------------------------------------------
# name, type, addr, desc, freq, ip/contract, port/code, modbusid/serial, image
#,מרינה - מטבח,modbus_meter,אנטיב 1,מרינה - מטבח,5,95.35.24.12,502,31,elnet,
#,מרינה - צ'ילר 1,modbus_meter,אנטיב 1,מרינה - צ'ילר 1,5,95.35.24.12,503,31,elnet,
#,מרינה - צ'ילר 2,modbus_meter,אנטיב 1,מרינה - צ'ילר 2,5,95.35.24.12,504,31,elnet,
#,מרינה - ראשי,modbus_meter,אנטיב 1,מרינה - ראשי,5,95.35.24.12,505,31,elnet,
#,אסטרל מרינה,iec_meter,אנטיב 1,אסטרל מרינה,5,5179119,735,5061420,,astral-marina.jpg
#,אסטרל וילג',iec_meter,קאמן 11,אסטרל וילג',5,4613130,853,9152740,,astral-village.jpg
#,אסטרל נירוונה,iec_meter,שפיפון 9,אסטרל נירוונה,5,4231287,735,10077130,,astral-nirvana.jpg
#,אסטרל סיסייד,iec_meter,דרבן 6,אסטרל סיסייד,5,4135364,735,6066440,,astral-seaside.jpg
#,אסטרל קורל,iec_meter,שפיפון 7,אסטרל קורל,5,4135714,735,10074990,,astral-coral.jpg
#--------------------------------------------------------------------

SERVER=localhost/negawatt-server/www
DRUSH_SERVER=
#SERVER=dev-negawatt.pantheon.io
#DRUSH_SERVER=@pantheon.negawatt.dev

#IMAGES=/Users/talia/Downloads/PICSGPS
IMAGES_DIR=/home/shachar/Downloads

# Get X-CSRF access-token
#AUTH=$(echo "admin:admin" | base64)
RESULT=$(curl -s --header "Authorization: Basic YWRtaW46YWRtaW4=" http://$SERVER/api/login-token)
XCSRF=$(echo $RESULT | sed 's/{"access_token":"\([^"]*\)".*/\1/')

# Enable file upload.
cd www
    drush $DRUSH_SERVER vset restful_file_upload 1 --strict=0
    drush cc all
cd -

# Loop for CSV lines.
N=1
cat "$0" | \
while IFS=, read first name type addr desc freq param1 param2 param3 param4 image
do
    # Make sure the first token is "#".
    if [ "$first" != "#" ]; then
        # Not a meter CSV line, skip it.
        continue;
    fi

    echo "Line $N: name=$name, $type, $addr, $desc, $freq, $param1, $param2, $param3, $image"

    # Create image and get file-id
    if [ "x$image" != "x" ]; then
        RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/file-upload \
            -F "file_upload=@$IMAGES_DIR/$image")

        IMAGE_ID=$(echo $RESULT | sed 's/.*"id":"\([0-9]*\)".*/\1/')
        IMAGE_FORM=' -F "image=$IMAGE_ID"'
        echo "image uploaded: $IMAGE_ID"
    else
        IMAGE_FORM=
    fi

    if [ "$type" = "iec_meter" ]; then
        # Create IEC meter
        COMMAND="curl -s --header \"access-token: $XCSRF\" http://$SERVER/api/iec_meters?XDEBUG_SESSION_START=19394
            -F \"label=$name\" -F \"place_description=$desc\" -F \"place_locality=אילת\" -F \"place_address=$addr\"
            -F \"account=$ACCOUNT\" -F \"max_frequency=$freq\" -F \"contract=$param1\" -F \"meter_code=$param2\"
            -F \"meter_serial=$param3\" $IMAGE_FORM"
    else
        # Create MODBUS meter
        COMMAND="curl -s --header \"access-token: $XCSRF\" http://$SERVER/api/modbus_meters?XDEBUG_SESSION_START=19394
            -F \"label=$name\" -F \"place_description=$desc\" -F \"place_locality=אילת\" -F \"place_address=$addr\"
            -F \"account=$ACCOUNT\" -F \"max_frequency=$freq\" -F \"ip_address=$param1\" -F \"ip_port=$param2\"
            -F \"meter_id=$param3\" -F \"meter_type=$param4\" $IMAGE_FORM"
    fi
    RESULT=$(eval $COMMAND)
#    echo $RESULT

    METER_ID=$(echo $RESULT | sed 's/.*\[{"id":"\([0-9]*\)".*/\1/')
    echo "meter created: $METER_ID"
    echo

    let "N++"
done