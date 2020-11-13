#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

if [ $# -lt 1 ]; then
  echo 1>&2 "$0: Chybí argument <číslo> velikosti swapfile v GiB. Použití: sudo-init-swapfile.sh <číslo>"
  exit 2
elif [ $# -gt 1 ]; then
  echo 1>&2 "$0: Příliš mnoho argumentů"
  exit 2
fi

SWAPEXISTS=0

if [ -f /swapfile ]
then
	echo "Nalezen aktivní swapfile. Deaktivuji a odstraňuji"
	SWAPEXISTS=1
	swapoff /swapfile
	rm -rf /swapfile
fi

echo "Vytvářím swapfile"
fallocate -l $1G /swapfile
echo "Nastavuji swapfile"
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "Swapfile nastaven a aktivován"

if [ ${SWAPEXISTS} == 0 ]; then
	echo "Zavádím swapfile do /etc/fstab"
	sed -i '$a /swapfile   none    swap    sw    0   0' /etc/fstab
fi
echo "Dokončeno"
