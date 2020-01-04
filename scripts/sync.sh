#!/bin/bash

# The purpose of this script is to sync CMS assets and DB bewteen local and
# remote enviroinments. Syncing can occur in two directions (push and pull) and
# the remote enironment can be either staging or production. This results in
# four possible command combinations:
#
# 1) ./sync.sh push staging
# 2) ./sync.sh pull staging
# 3) ./sync.sh push production
# 4) ./sync.sh pull production
#
# This script requires a sibling file named ".env" that contains named
# variabels as follows:
#
# |_ASSETS_DIR (craft CMS variables)
# |_WEB_DIR
# |_DB_DATABASE (craft CMS variable)
# |_DB_USER (craft CMS variable)
# |_DB_PASSWORD (craft CMS variable)
# |_HOME_PATH
# |_STAG_HOST
# |_STAG_USER
# |_STAG_HOME_PATH
# |_STAG_DB_DATABASE
# |_STAG_DB_USER
# |_STAG_DB_PASSWORD
# |_PROD_HOST
# |_PROD_USER
# |_PROD_HOME_PATH
# |_PROD_DB_DATABASE
# |_PROD_DB_USER
# |_PROD_DB_PASSWORD

# Import env variables
source .env

# Constants
BACKUP_TMP="db.sql"

# Initialize variables
REMOTE_HOST=""
REMOTE_USER=""
REMOTE_HOME_PATH=""
REMOTE_DB_DATABASE=""
REMOTE_DB_USER=""
REMOTE_DB_PASSWORD=""

################################################################################
# Error checks
################################################################################

# Check for required arguments
if [[ -z "$1" || ( "$1" != "push" && "$1" != "pull" ) ]]; then
    echo "Please provide sync direction"

    exit
fi

if [[ -z "$2" || ( "$2" != "staging" && "$2" != "production" ) ]]; then
    echo "Please provide a valid remote environment argument"

    exit
fi

if [[ "$1" == "push" && "$2" == "production" ]]; then
    echo "Let's not push to production mkay"

    exit
fi

# Set remote environment
if [ "$2" = "staging" ]; then
    REMOTE_HOST="$STAG_HOST"
    REMOTE_USER="$STAG_USER"
    REMOTE_HOME_PATH="$STAG_HOME_PATH"
    REMOTE_DB_DATABASE="$STAG_DB_DATABASE"
    REMOTE_DB_USER="$STAG_DB_USER"
    REMOTE_DB_PASSWORD="$STAG_DB_PASSWORD"
elif [ "$2" = "production" ]; then
    REMOTE_HOST="$PROD_HOST"
    REMOTE_USER="$PROD_USER"
    REMOTE_HOME_PATH="$PROD_HOME_PATH"
    REMOTE_DB_DATABASE="$PROD_DB_DATABASE"
    REMOTE_DB_USER="$PROD_DB_USER"
    REMOTE_DB_PASSWORD="$PROD_DB_PASSWORD"
fi

################################################################################
# Data sync
################################################################################

# Steps: Ignore owner, group, and permissions on push rsync
# 1) Dump DB
# 2) Sync DB
# 3) Import DB
# 4) Sync assets
# 5) Remove DB backup

if [ "$1" = "push" ]; then
    mysqldump --no-defaults -u"$DB_USER" -p"$DB_PASSWORD" "$DB_DATABASE" > "$HOME_PATH/$BACKUP_TMP"
    rsync -azP --no-o --no-g --no-p "$HOME_PATH/$BACKUP_TMP" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME_PATH"
    ssh "$REMOTE_USER@$REMOTE_HOST" "mysql -u$REMOTE_DB_USER -p'$REMOTE_DB_PASSWORD' $REMOTE_DB_DATABASE < $REMOTE_HOME_PATH/$BACKUP_TMP"
    rsync -azh --no-o --no-g --no-p "$HOME_PATH/$WEB_DIR/$ASSETS_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME_PATH/$WEB_DIR/$ASSETS_DIR"
elif [ "$1" = "pull" ]; then
    ssh "$REMOTE_USER@$REMOTE_HOST" "mysqldump --no-defaults -u$REMOTE_DB_USER -p'$REMOTE_DB_PASSWORD' $REMOTE_DB_DATABASE > $REMOTE_HOME_PATH/$BACKUP_TMP"
    rsync -azP "$REMOTE_USER@$REMOTE_HOST":"$REMOTE_HOME_PATH/$BACKUP_TMP" "$HOME_PATH/"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_DATABASE" < "$BACKUP_TMP"
    rsync -azh "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME_PATH/$WEB_DIR/$ASSETS_DIR/" "$HOME_PATH/$WEB_DIR/$ASSETS_DIR"
fi

rm "$HOME_PATH/$BACKUP_TMP"
ssh "$REMOTE_USER@$REMOTE_HOST" "rm $REMOTE_HOME_PATH/$BACKUP_TMP"
