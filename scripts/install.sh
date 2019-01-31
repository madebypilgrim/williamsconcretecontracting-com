#!/bin/bash

# TODO:
# The purpose of this script is to install all dependencies for Craft CMS.
#
# This script requires a sibling file named ".env" that contains named
# variabels as follows:
#
# |_ DB_DATABASE (craft CMS variable)
# |_ DB_USER (craft CMS variable)
# |_ DB_PASSWORD (craft CMS variable)
# |_ SSH_HOST
# |_ STAG_DB_DATABASE
# |_ STAG_DB_USER
# |_ STAG_DB_PASSWORD
# |_ STAG_HOME_PATH
# |_ PROD_DB_DATABASE
# |_ PROD_DB_USER
# |_ PROD_DB_PASSWORD
# |_ PROD_HOME_PATH

# Import env variables
source .env

# Constants

# Initialize variables
# REMOTE_DB_DATABASE=""
# REMOTE_DB_USER=""
# REMOTE_DB_PASSWORD=""
# REMOTE_HOME_PATH=""

# Set remote environment
# if [ "$1" = "staging" ]; then
#   REMOTE_DB_DATABASE="$STAG_DB_DATABASE"
#   REMOTE_DB_USER="$STAG_DB_USER"
#   REMOTE_DB_PASSWORD="$STAG_DB_PASSWORD"
#   REMOTE_HOME_PATH="$STAG_HOME_PATH"
# elif [ "$1" = "production" ]; then
#   REMOTE_DB_DATABASE="$PROD_DB_DATABASE"
#   REMOTE_DB_USER="$PROD_DB_USER"
#   REMOTE_DB_PASSWORD="$PROD_DB_PASSWORD"
#   REMOTE_HOME_PATH="$PROD_HOME_PATH"
# fi

################################################################################
# Create DB and USER w/ account
################################################################################

# mysql> CREATE DATABASE dbname;
# mysql> GRANT ALL ON dbname.* TO 'username' IDENTIFIED BY 'password';
# mysql> FLUSH PRIVILEGES;

################################################################################
# Instal PHP extensions
# https://benicetobears.com/2018/07/24/how-to-install-craft-cms-on-a-digital-ocean-server/
################################################################################

# apt-get update
# apt-get upgrade
# apt-get install php-mbstring
# apt-get install php-mcrypt
# apt-get install php-imagick
# apt-get install php-curl
# apt-get install php-xml
# apt-get install php-zip
#
# a2enmod rewrite
# service apache2 restart
#
# chown -R www-data:www-data /etc/apach2
# chown -R www-data:www-data /var/www/

################################################################################
# Install Composer
# https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-ubuntu-18-04
# TODO: Pass has as argument?
# https://composer.github.io/pubkeys.html
################################################################################

# curl -sS https://getcomposer.org/installer -o composer-setup.php
# HASH=$HASH
# php -r "if (hash_file('SHA384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
# php composer-setup.php --install-dir=/usr/local/bin --filename=composer
