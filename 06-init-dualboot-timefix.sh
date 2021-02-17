#!/bin/bash

if [ "$(whoami)" == "root" ]; then
	echo "Nepoužívej sudo - použij pouze jako normální uživatel"
	exit 1
fi

if [ -f ~/.jss-dualboot-timefix-done ]
then
    echo "Už jenou provedeno" 
else
	echo "Upravuji nastavení času, kvůli inkompetenci Microsoftu"
	timedatectl set-local-rtc 1 --adjust-system-clock

	touch ~/.jss-dualboot-timefix-done
fi

echo "Dokončeno"
