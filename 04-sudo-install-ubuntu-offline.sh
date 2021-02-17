#!/bin/bash

if [ "$(whoami)" != "root" ]; then
	echo "Chybí sudo"
	exit 1
fi

apt-get update

echo "Instaluji offline balíky"
dpkg -i /home/$SUDO_USER/Nextcloud/Install/Linux/Programs/currentInstallers/*.deb
apt-get update

echo "Dokončeno offline install"

echo "Instaluji binárky k tiskárně Xerox Phaser 3250DN"

case $(uname -m) in
	i386|i686) cp /home/$SUDO_USER/Nextcloud/Install/Linux/Drivers/XeroxPhaser3250/i386/* /usr/lib/cups/filter/;;
	x86_64) cp /home/$SUDO_USER/Nextcloud/Install/Linux/Drivers/XeroxPhaser3250/x86_64/* /usr/lib/cups/filter/;;
	*) echo "neznam" ;;
esac

chmod +x /usr/lib/cups/filter/libscmssc.so
chmod +x /usr/lib/cups/filter/libscmssf.so
chmod +x /usr/lib/cups/filter/pscms
chmod +x /usr/lib/cups/filter/rastertosamsunginkjet
chmod +x /usr/lib/cups/filter/rastertosamsungpcl
chmod +x /usr/lib/cups/filter/rastertosamsungspl
chmod +x /usr/lib/cups/filter/rastertosamsungsplc
chmod +x /usr/lib/cups/filter/smfpautoconf

echo "Dokončeno - Zbývá přidat pomocí wizarda a vybrat ppd soubor 3200-MFP"

#volani user scriptu
su -c "bash $PWD/05-init-user-confs.sh" $SUDO_USER
