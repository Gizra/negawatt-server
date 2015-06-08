#!/bin/bash

# Load electricity data and test normalizer.
cd www
echo Resetting DB.
DIR=profiles/negawatt/modules/custom/negawatt_normalizer/tests
tar -zxf $DIR/reference-db.tar.gz -C $DIR/
`drush sql-connect` < $DIR/reference-db.sql
rm $DIR/reference-db.sql

# Run normalizer.
echo Normalizing electricity.
drush process-meter --verbose --user=1 2>&1

# Compare to reference dump.
echo Comparing results.
tar -zxf $DIR/reference-normalized.tar.gz -C $DIR/
drush sql-dump --tables-list=negawatt_electricity_normalized > $DIR/dump-normalized.sql
# Remove completion timestamp so files will be equal.
sed -i '/Dump completed on/d' $DIR/dump-normalized.sql
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