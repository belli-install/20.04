#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

apt-get update

#mysql-admin mysql-query-browser pgadmin 
apt-get install mysql-server mysql-client libhtml-template-perl tinyca postgresql postgresql-client postgresql-contrib sqlite sqlite3 apache2 apache2-utils php7.0 php7.0-pgsql php-xdebug php7.0-tidy php7.0-curl php7.0-imap php7.0-xsl php7.0-cli php-apcu php7.0-gd php7.0-mysql php7.0-sqlite3 php7.0-intl

service apache2 restart

apt-get update

echo "Dokončeno"
