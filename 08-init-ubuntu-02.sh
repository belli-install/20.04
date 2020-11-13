#!/bin/bash

if [ "$(whoami)" == "root" ]; then
	echo "Nepoužívej sudo - použij pouze jako normální uživatel"
	exit 1
fi

if [ -f ~/.jss-scriptsinit-done ]
then
    echo "Už jenou provedeno" 
else
	echo "Vytvářím symlinky"

	#adresar scripty
	mv ~/scripty ~/scripty-$(date +%Y%m%d%H%M%S)
	ln -s ~/Nextcloud/.lnx/Scripty ~/scripty

	touch ~/.jss-scriptsinit-done
fi

echo "Dokončeno - zbytlé scripty v cloudu"
echo "cd ~/scripty/Install-Scripty/20.04/"

