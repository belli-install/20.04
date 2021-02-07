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

if [ -f ~/.jss-basicinit-done ]
then
    echo "Init adresářů byl již proveden" 
else    
	#Vytvorime adresare
	echo "Vytvářím profilové adresáře"
	chmod 700 /home/$USER #kvuli apachovi
	mkdir ~/Weby
	chmod 755 ~/Weby -R
	mkdir ~/.Programy
	mkdir ~/Temp
	mkdir ~/.FavWP
	mkdir ~/.SafeWP
	mkdir ~/.KPX
	mkdir ~/Backup
	#mkdir ~/Backup/Quick

	touch ~/.jss-basicinit-done
fi

#zkopirujeme cast konfiguraku, zbytek udelame po syncu
echo "Kopíruji první část konfiguráků, zbytek proveď až po syncu"
cp -vfR $PWD/Data/config/* ~/.config/
cp -vfR $PWD/Data/local/* ~/.local/

echo "Importuji DBus nastavení"
dconf load / < $PWD/Data/all-dconf.dconf

#Upravy existujicich zkratek, abych si nezlomil pri praci prsty
echo "Importuji základní úparvy klávesových zkratek"
gsettings set org.gnome.desktop.wm.keybindings maximize "['<Alt>F10']"
gsettings set org.gnome.desktop.wm.keybindings minimize "['<Super>Down']"
gsettings set org.gnome.desktop.wm.keybindings toggle-maximized "['<Super>Up']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-up "['<Control><Super><Alt>Up']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-down "['<Control><Super><Alt>Down']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-left "['<Control><Super><Alt>Left']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-right "['<Control><Super><Alt>Right']"

#nastaveni Dock
echo "Nastavuji Dock"
gsettings set org.gnome.shell.extensions.dash-to-dock dash-max-icon-size 32
gsettings set org.gnome.shell.extensions.dash-to-dock autohide true
gsettings set org.gnome.shell.extensions.dash-to-dock intellihide false

#install Joplin
echo "Instaluji Joplin"
wget -O - https://raw.githubusercontent.com/laurent22/joplin/dev/Joplin_install_and_update.sh | bash

echo "Dokončeno"

