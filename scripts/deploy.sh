#!/bin/bash

# The purpose of this script is to deploy files to remote enviroinments.
# The remote enironment can be either staging or production.
#
# This script requires a sibling file named ".envsh" that contains named
# variabels as follows:
#
# |_ HOME_PATH
# |_ SSH_HOST
# |_ STAG_HOME_PATH
# |_ PROD_HOME_PATH

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
  REMOTE_HOME_PATH="$STAG_HOME_PATH"
elif [ "$1" = "production" ]; then
  REMOTE_HOME_PATH="$PROD_HOME_PATH"
fi

################################################################################
# File sync
################################################################################

# TODO: Add :- .gitignore flag
# Sync all files
rsync -azh --no-o --no-g --no-p --filter=":- .gitignore" "$HOME_PATH/" "$SSH_HOST:$REMOTE_HOME_PATH"
# Run composer (as root) and reset file permissions
ssh "${SSH_HOST}" /bin/bash << EOF
	COMPOSER_ALLOW_SUPERUSER=1
	composer install --no-interaction --prefer-dist --optimize-autoloader
	chown -R ${USER}:${GROUP} ${REMOTE_HOME_PATH}
EOF
