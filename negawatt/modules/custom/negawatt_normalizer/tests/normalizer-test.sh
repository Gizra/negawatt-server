#!/bin/bash

# Test if running under pantheon
if [ "$1" = "pantheon" ]; then
    DRUSH_PARAM="@negawatt --uri=http://127.0.0.1:8080"
fi

# Load electricity data and test normalizer.
cd www
echo Resetting DB.
DIR=profiles/negawatt/modules/custom/negawatt_normalizer/tests
drush $DRUSH_PARAM sql-drop -y
tar -zxf $DIR/reference-db.tar.gz -C $DIR/
`drush $DRUSH_PARAM sql-connect` < $DIR/reference-db.sql
rm $DIR/reference-db.sql

# Run normalizer.
echo Normalizing electricity.
drush $DRUSH_PARAM process-meter --user=1 2>&1

# Compare to reference dump.
echo Comparing results.
tar -zxf $DIR/reference-normalized.tar.gz -C $DIR/
drush $DRUSH_PARAM sql-dump --tables-list=negawatt_electricity_normalized > $DIR/dump-normalized.sql
# Remove completion timestamp so files will be equal.
sed -i -e '/-- Dump completed on/d' \
        -e '/-- Host:/d' \
        -e '/-- Server version/d' \
        -e '/-- MySQL dump/d' \
        -e 's/AUTO_INCREMENT=[0-9]*//' \
        -e $'s/[)],[(]/),\\\n(/g' \
        $DIR/dump-normalized.sql
cmp --silent $DIR/dump-normalized.sql $DIR/reference-normalized.sql
CMP_RESULT=$?

# Check that cmp went fine.
if [ $CMP_RESULT -eq 0 ]; then
    echo Result OK.
    rm $DIR/dump-normalized.sql
    rm $DIR/reference-normalized.sql
    exit 0
fi

# Files are different. Show difference and exit with error
echo Result differ:
diff -c $DIR/dump-normalized.sql $DIR/reference-normalized.sql

exit 1