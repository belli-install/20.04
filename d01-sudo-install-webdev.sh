#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

apt-get update

apt-get install composer npm -y

apt-get update

echo "Dokončeno"
