#!/bin/bash

# Create meters from a directory of images with geocode data.

ACCOUNT=7

SERVER=localhost/negawatt-server/www
#SERVER=dev-negawatt.pantheon.io
DRUSH_SERVER=
#DRUSH_SERVER=@pantheon.negawatt.dev
#IMAGES=/Users/talia/Downloads/PICSGPS/*.JPG
#IMAGES=/home/shachar/Downloads/*.JPG
IMAGES=/home/shachar/Pictures/EilatLightPoles/*.JPG

# Get X-CSRF access-token
#AUTH=$(echo "admin:admin" | base64)
RESULT=$(curl -s --header "Authorization: Basic YWRtaW46YWRtaW4=" http://$SERVER/api/login-token)
XCSRF=$(echo $RESULT | sed 's/{"access_token":"\([^"]*\)".*/\1/')

cd www
    drush $DRUSH_SERVER vset restful_file_upload 1 --strict=0
    drush cc all
cd -

# Loop for files
COUNT=${#IMAGES[@]}
N=1
for IMAGE in $IMAGES; do
    echo "image: $N/$COUNT $IMAGE"

    # Create image and get file-id
    RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/file-upload \
        -F "file_upload=@$IMAGE")

    IMAGE_ID=$(echo $RESULT | sed 's/.*"id":"\([0-9]*\)".*/\1/')
    echo "image uploaded: $IMAGE_ID"

    # Create meter
    RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/iec_meters \
        -F "label=עמוד $N" -F "place_description=תאורת רחוב, עמוד $N" -F "place_locality=אילת" -F "place_address= " \
        -F "account=$ACCOUNT" -F "max_frequency=5" -F "contract=123456" -F "meter_code=789" -F "meter_serial=$N" \
        -F "image=$IMAGE_ID")
#    echo $RESULT

    METER_ID=$(echo $RESULT | sed 's/.*\[{"id":"\([0-9]*\)".*/\1/')
    echo "meter created: $METER_ID"

    let "N++"
done