#!/bin/bash

# The purpose of this script is to deploy files to remote enviroinments.
# The remote enironment can be either staging or production.
#
# This script requires a sibling file named ".envsh" that contains named
# variabels as follows:
#
# |_HOME_PATH
# |_STAG_HOST
# |_STAG_USER
# |_STAG_HOME_PATH
# |_PROD_HOST
# |_PROD_USER
# |_PROD_HOME_PATH

# Import env variables
source .env

# Constants
USER="www-data"
GROUP="www-data"

# Initialize variables
REMOTE_HOME_PATH=""

################################################################################
# Error checks
################################################################################

# Check for required arguments
if [[ -z "$1" || ( "$1" != "staging" && "$1" != "production" ) ]]; then
  echo "Please provide a valid remote environment argument"

  exit
fi

# Set remote environment
if [ "$1" = "staging" ]; then
  REMOTE_HOST="$STAG_HOST"
  REMOTE_USER="$STAG_USER"
  REMOTE_HOME_PATH="$STAG_HOME_PATH"
elif [ "$1" = "production" ]; then
  REMOTE_HOST="$PROD_HOST"
  REMOTE_USER="$PROD_USER"
  REMOTE_HOME_PATH="$PROD_HOME_PATH"
fi

################################################################################
# File sync
################################################################################

# Sync all files
rsync -azh --no-o --no-g --no-p --filter=":- .gitignore" --delete "$HOME_PATH/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_HOME_PATH"
# Run composer
ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_HOME_PATH && composer install --no-interaction --prefer-dist --optimize-autoloader"
