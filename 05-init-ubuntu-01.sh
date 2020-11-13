#!/bin/bash

if [ -f ~/.jss-basicinit-done ]
then
    echo "Init adresářů byl již proveden" 
else    
	#zkopirujeme cast konfiguraku, zbytek udelame po syncu
	echo "Kopíruji první část konfiguráků, zbytek proveď až po syncu"
	cp -vfR $PWD/Data/config/* ~/.config/

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

#install Joplin
echo "Instaluji Joplin"
wget -O - https://raw.githubusercontent.com/laurent22/joplin/dev/Joplin_install_and_update.sh | bash

echo "Dokončeno"
