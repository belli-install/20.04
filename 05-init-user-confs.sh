#!/bin/bash

if [ "$(whoami)" == "root" ]; then
	echo "Nepoužívej sudo - použij pouze jako normální uživatel"
	exit 1
fi

if [ -f ~/.jss-localinit-done ]
then
    echo "Už jenou provedeno" 
else
	echo "Kopíruji konfiguráky a vytvářím symlinky"
	#adresar .Programy
	mkdir ~/.Programy
	cp -vfR ~/Nextcloud/Install/Linux/Programs/currentPrograms/* ~/.Programy/
	
	#adresar scripty
	mv ~/scripty ~/scripty-$(date +%Y%m%d%H%M%S)
	ln -s ~/Nextcloud/.lnx/Scripty ~/scripty

	#adresar Dokuments
	mv ~/Documents ~/Documents-$(date +%Y%m%d%H%M%S)
	ln -s ~/Nextcloud/Dokumenty ~/Documents

	#adresar Pictures
	mv ~/Pictures ~/Pictures-$(date +%Y%m%d%H%M%S)
	ln -s ~/Nextcloud/Obrázky ~/Pictures

	#Joplin
	rm -rf ~/.config/Joplin
	rm -rf ~/.config/joplin-desktop
	cp -vrf ~/Nextcloud/Install/Linux/Conf/Home/.config/Joplin ~/.config/
	cp -vrf ~/Nextcloud/Install/Linux/Conf/Home/.config/joplin-desktop ~/.config/

	#keepassxc
	rm -rf ~/.config/keepassxc
	cp -vrf ~/Nextcloud/Install/Linux/Conf/Home/.config/keepassxc ~/.config/

	#filezilla
	rm -rf ~/.config/filezilla
	cp -vrf ~/Nextcloud/Install/Linux/Conf/Home/.config/filezilla ~/.config/

	#remmina
	rm -rf ~/.config/remmina
	cp -vrf ~/Nextcloud/Install/Linux/Conf/Home/.config/remmina ~/.config/

	touch ~/.jss-localinit-done
fi

#kyeb shortcuts
echo "Nastavuji klávesové zkratky"
#Vyber nahodneho WP (ctrl alt win n)
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name "'ChangeBackground'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding "'<Primary><Super><Alt>n'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command "'bash /home/$USER/scripty/Gnome/20.04/change-gnome-wallpaper-lockscreen.sh'"

#Vyber nahodneho WP ze SafeWP (ctrl win n)
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ name "'ChangeSafeBackground'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ binding "'<Primary><Super>n'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/ command "'bash /home/$USER/scripty/Gnome/20.04/change-gnome-wallpaper-lockscreen-safewp.sh'"

#Vyber nahodneho WP z FavWP (ctrl shift win n)
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ name "'ChangeFavBackground'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ binding "'<Primary><Super><Shift>n'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/ command "'bash /home/$USER/scripty/Gnome/20.04/change-gnome-wallpaper-lockscreen-favwp.sh'"

#Nautilus (win e)
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ name "'Nautilus'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ binding "'<Super>e'"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/ command "'nautilus'"

#Zapsani do pole custom zkratek - wtf, ale povinne
gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom1/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom2/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom3/']"

echo "Dokončeno"
