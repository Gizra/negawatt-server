#!/bin/bash

# Modify the MySQL settings below so they will match your own.
MYSQL_USERNAME="root"
MYSQL_PASSWORD="root"
MYSQL_HOST="localhost"
MYSQL_DB_NAME="negawatt"

# Modify the URL below to match your OpenScholar base domain URL.
BASE_DOMAIN_URL="http://localhost/negawatt-server/www"

# Modify the login details below to be the desired login details for the Administrator account.
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
ADMIN_EMAIL="admin@example.com"

chmod 777 www/sites/default
rm -rf www/
mkdir www

bash scripts/build

cd www

drush si -y negawatt --account-name=$ADMIN_USERNAME --account-pass=$ADMIN_PASSWORD --account-mail=$ADMIN_EMAIL --db-url=mysql://$MYSQL_USERNAME:$MYSQL_PASSWORD@$MYSQL_HOST/$MYSQL_DB_NAME --uri=$BASE_DOMAIN_URL

# Development modules
drush en devel diff views_ui field_ui migrate_ui mimemail -y

# These commands migrates dummy content and is used for development and testing.
drush en negawatt_migrate -y

# Must allow access to these dirs for logo images migration and processing.
chmod 777 sites/default/files
chmod 777 sites/default/files/styles

echo 'Migrating data...'
DATA_DIR="../../negawatt-data/sql-migrate-unified"
drush vset negawatt_migrate_sql 0
`drush sql-connect` < $DATA_DIR/_negawatt_account_migrate.sql
`drush sql-connect` < $DATA_DIR/_negawatt_satec_meter_migrate.sql
`drush sql-connect` < $DATA_DIR/_negawatt_iec_meter_migrate.sql
`drush sql-connect` < $DATA_DIR/_negawatt_electricity_migrate.sql
`drush sql-connect` < $DATA_DIR/_negawatt_electricity_normalized_migrate.sql
drush mi --all --user=1

# This command does the login for you when the build script is done. It will open a new tab in your default browser and login to your project as the Administrator. Comment out this line if you do not want the login to happen automatically.
drush uli --uri=$BASE_DOMAIN_URL

# Install client application.
cd ../client
npm install && bower install

# Open browser (Mac)
open $BASE_DOMAIN_URL
# Open browser (Linux)
xdg-open $BASE_DOMAIN_URL
