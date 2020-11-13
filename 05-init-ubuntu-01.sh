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
	mkdir ~/Backup/Quick

	touch ~/.jss-basicinit-done
fi

#zkopirujeme cast konfiguraku, zbytek udelame po syncu
echo "Kopíruji první část konfiguráků, zbytek proveď až po syncu"
cp -vfR $PWD/Data/config/* ~/.config/
cp -vfR $PWD/Data/local/* ~/.local/

echo "Importuji DBus nastavení"
dconf load / < $PWD/Data/all-dconf.dconf

#install Joplin
echo "Instaluji Joplin"
wget -O - https://raw.githubusercontent.com/laurent22/joplin/dev/Joplin_install_and_update.sh | bash

echo "Dokončeno"
