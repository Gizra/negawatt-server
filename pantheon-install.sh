#!/bin/bash

PANTHEON_DIR="/var/www/pantheon-negawatt"

rm -rf $PANTHEON_DIR/profiles/negawatt
cp -R pipeline $PANTHEON_DIR/profiles/negawatt

cd $PANTHEON_DIR
git add .
git commit -am "Site update"
git push

cd -
# Excute Pantheon install outside of the Pantheon Dir.
# Make sure you have the alias setup (use `drush sa` too see the aliases).

drush @pantheon.negawatt.dev sql-drop -y --strict=0
drush @pantheon.negawatt.dev si -y negawatt --account-pass=admin
# Enable Pantheon's Apache Solr integration.
drush @pantheon.negawatt.dev en pantheon_apachesolr -y --strict=0
drush @pantheon.negawatt.dev en negawatt_migrate -y --strict=0
drush @pantheon.negawatt.dev mi --all --user=1 --strict=0
drush @pantheon.negawatt.dev uli
