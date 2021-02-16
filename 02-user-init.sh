#!/bin/bash

if [ "$(whoami)" == "root" ]; then
	echo "Nepoužívej sudo - použij pouze jako normální uživatel"
	exit 1
fi

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

echo "Dokončeno - user install/init."
