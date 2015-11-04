#!/bin/bash

# Create meters from CSV data.

ACCOUNT=4 # Carmiel

#SERVER=localhost/negawatt-server/www
#DRUSH_SERVER=
SERVER=dev-negawatt.pantheon.io
DRUSH_SERVER=@pantheon.negawatt.dev

#IMAGES=/Users/talia/Downloads/PICSGPS
IMAGES_DIR=/home/shachar/Downloads/Carmiel/new/

CSV_FILE=CarmielPics.csv

# Get X-CSRF access-token
#AUTH=$(echo "admin:admin" | base64)
RESULT=$(curl -s --header "Authorization: Basic YWRtaW46YWRtaW4=" http://$SERVER/api/login-token)
XCSRF=$(echo $RESULT | sed 's/{"access_token":"\([^"]*\)".*/\1/')

# Enable file upload.
#cd www
    drush $DRUSH_SERVER vset restful_file_upload 1 --strict=0
    drush cc all
#cd -

# Loop for CSV lines.
N=1
cat "$IMAGES_DIR/$CSV_FILE" | \
while IFS=, read image capacity count height kind comment latitude longitude
do
    # Skip first (titles) line.
    if [ "$image" == "Name" ]; then
        # Not a meter CSV line, skip it.
        continue;
    fi

    echo "Line $N: image=$image, $capacity, $count, $height, $kind, $comment"

    # Create image and get file-id
    if [ "x$image" != "x" ]; then
        RESULT=$(curl -s --header "access-token: $XCSRF" http://$SERVER/api/file-upload \
            -F "file_upload=@$IMAGES_DIR/${image}_1.jpg")

        IMAGE_ID=$(echo $RESULT | sed 's/.*"id":"\([0-9]*\)".*/\1/')
        IMAGE_FORM=' -F "image=$IMAGE_ID"'
        echo "image uploaded: $IMAGE_ID"
    else
        IMAGE_FORM=
    fi

    # Set meter description.
    desc=""
    if [ "x$capacity" != "x" ] ; then desc="הספק: $capacity" ; fi
    if [ "x$count" != "x" ] ; then desc="$desc, מס' ג''ת: $count" ; fi
    if [ "x$height" != "x" ] ; then desc="$desc, גובה: $height" ; fi
    if [ "x$kind" != "x" ] ; then desc="$desc, סוג: $kind" ; fi
    if [ "x$comment" != "x" ] ; then desc="$desc, הערות: $comment" ; fi

    # Create IEC meter
    COMMAND="curl -s --header \"access-token: $XCSRF\" http://$SERVER/api/iec_meters
        -F \"label=תאורת רחוב, עמוד $N\" -F \"place_description=$desc\" -F \"place_locality=כרמיאל\" -F \"place_address=\"
        -F \"account=$ACCOUNT\" -F \"max_frequency=5\" $IMAGE_FORM"
    RESULT=$(eval $COMMAND)
#    echo $COMMAND
#    echo $RESULT

    METER_ID=$(echo $RESULT | sed 's/.*\[{"id":"\([0-9]*\)".*/\1/')
    echo "meter created: $METER_ID"
    echo

    let "N++"
done