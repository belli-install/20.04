#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

apt-get update

if [ -f /etc/.jss-software-sources-added ]
then
    echo "Softwarové zdroje už byly jednou přidány" 
else
	#DoubleCommander
	sh -c "echo 'deb http://download.opensuse.org/repositories/home:/Alexx2000/xUbuntu_20.04/ /' > /etc/apt/sources.list.d/home:Alexx2000.list"
	wget -nv https://download.opensuse.org/repositories/home:Alexx2000/xUbuntu_20.04/Release.key -O Release.key
	apt-key add - < Release.key  
	rm Release.key
	apt-get update

	#Nextcloud
	add-apt-repository ppa:nextcloud-devs/client
	apt-get update

	#KeepassXC
	add-apt-repository ppa:phoerious/keepassxc
	apt-get update
	
	touch /etc/.jss-software-sources-added
fi

apt-get install dconf-editor libglib2.0-dev libwxgtk3.0-gtk3-0v5 x11-utils gnome-tweaks cifs-utils net-tools samba-common samba winbind nextcloud-client inkscape blender chrome-gnome-shell gvfs-fuse smartmontools gsmartcontrol gparted exfat-fuse hfsprogs git rabbitvcs-cli rabbitvcs-core rabbitvcs-gedit rabbitvcs-nautilus filezilla tinyca arduino subversion subversion-tools ffmpeg p7zip p7zip-full p7zip-rar simple-scan gimagereader tesseract-ocr-ces hunspell-cs synaptic audacious audacious-plugins pepperflashplugin-nonfree openjdk-14-jre openjdk-14-jre-headless openjdk-14-jdk openjdk-14-jdk-headless geany geany-plugins k3b pidgin pidgin-plugin-pack pidgin-bot-sentry vlc keepassxc gpicview zim guake meld gimp gimp-data gimp-data-extras gimp-plugin-registry ubuntu-restricted-extras imagemagick jayatana doublecmd-gtk network-manager-openvpn-gnome devede -y

apt-get update

apt-get upgrade -y

dpkg -i $PWD/Data/install/*.deb

apt-get update

apt-get autoremove -y

echo "Dokončeno"
