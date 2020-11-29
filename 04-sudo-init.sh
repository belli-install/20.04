#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

if [ -f /etc/.jss-hostnames-added ]
then
    echo "Hostanames už byly nastaveny" 
else
	echo "Nastavuji Hostnames"
	#nastavit bluetooth jmeno
	echo "PRETTY_HOSTNAME=$(hostname)" | sudo tee /etc/machine-info

	echo "127.0.1.1	$(hostname)" > ~/tmp_file && 
	echo "127.0.0.1	weby" >> ~/tmp_file && 
	cat /etc/hosts >> ~/tmp_file &&
	mv ~/tmp_file /etc/hosts
	
	touch /etc/.jss-hostnames-added
fi

echo "UPNP adresář"
mkdir /media/upnp
chmod 777 /media/upnp

# uprava grubu k zapamatovani posledni zvolene pozice
echo "Aktivuji Savedefault v GRUBu"
cp -vf $PWD/Data/etc/default/grub /etc/default/
update-grub

# Deaktivace popupu z Evolution kalendare
echo "Deaktivuji otravnost kalendáře"
cp -vf $PWD/Data/etc/xdg/autostart/org.gnome.Evolution-alarm-notify.desktop /etc/xdg/autostart/

echo "Dokončeno"
