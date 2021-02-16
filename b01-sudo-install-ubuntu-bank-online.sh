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

apt-get install dconf-editor libglib2.0-dev libwxgtk3.0-gtk3-0v5 x11-utils gnome-tweaks cifs-utils net-tools samba-common samba winbind nextcloud-client chrome-gnome-shell gvfs-fuse smartmontools gsmartcontrol gparted exfat-fuse hfsprogs git p7zip p7zip-full p7zip-rar simple-scan gimagereader synaptic pepperflashplugin-nonfree openjdk-14-jre openjdk-14-jre-headless geany geany-plugins vlc keepassxc gpicview guake ubuntu-restricted-extras imagemagick doublecmd-gtk network-manager-openvpn-gnome -y

apt-get update

apt-get upgrade -y

wget -v -N -P $PWD/Data/install/ https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

dpkg -i $PWD/Data/install/*.deb

apt-get update

apt-get autoremove -y

echo "Instalace dokončena"
notify-send "Instalace Dokončena"

###########	SWAP
SWAPSIZE=4 #default swap size in GB
if [ $# -lt 1 ]; then
  echo 1>&2 "$0: Chybí argument <číslo> velikosti swapfile v GiB. Použití: sudo-init-swapfile.sh <číslo> - Prozatím nastavuji ${SWAPSIZE}GB."
#  exit 2
elif [ $# -gt 1 ]; then
  echo 1>&2 "$0: Příliš mnoho argumentů. Použití: sudo-init-swapfile.sh <číslo v GB> - Prozatím nastavuji ${SWAPSIZE}GB."
#  exit 2
fi

if [ $# = 1 ]; then
re='^[0-9]+$'
 if ! [[ $1 =~ $re ]]; then
   echo "$0: Argument není číslo. Swap bude prozatím ${SWAPSIZE}GB." >&2
 elif [[ $1 =~ $re ]]; then
  SWAPSIZE=$1
 fi
 
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
fallocate -l ${SWAPSIZE}G /swapfile
echo "Nastavuji swapfile"
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo "Swapfile nastaven a aktivován"

if [ ${SWAPEXISTS} == 0 ]; then
	echo "Zavádím swapfile do /etc/fstab"
	sed -i '$a /swapfile   none    swap    sw    0   0' /etc/fstab
fi

##########	INIT
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

# uprava grubu k zapamatovani posledni zvolene pozice
echo "Aktivuji Savedefault v GRUBu"
cp -vf $PWD/Data/etc/default/grub /etc/default/
update-grub

# Deaktivace popupu z Evolution kalendare
echo "Deaktivuji otravnost kalendáře"
cp -vf $PWD/Data/etc/xdg/autostart/org.gnome.Evolution-alarm-notify.desktop /etc/xdg/autostart/

echo "Dokončeno - root install/init"

#volani user scriptu
su -c "bash $PWD/b02-user-init.sh" $SUDO_USER
