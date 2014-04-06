# Debian 7.x Test Enviroment Install HOWTO

## Create a user
```
# adduser meteor
```

## Install meteor
```
$ curl https://install.meteor.com | /bin/sh
```
Append ```PATH=$PATH:~/.meteor``` to .bashsrc

## Install Node.js
```
# apt-get update
# apt-get install git-core curl build-essential openssl libssl-dev
```
```
$ git clone https://github.com/joyent/node.git
$ cd node
$ git tag # Gives you a list of released versions
$ git checkout v0.9.9
$ ./configure --prefix=/home/meteor/.node
$ make
$ sudo make install
$ cd ~
$ rm -rf node
```

Append ```PATH=$PATH:~/.node/bin``` to .bashsrc

## Install NPM
```
$ wget https://npmjs.org/install.sh
$ chmod +x install.sh
$ ./install.sh
$ rm install.sh
```

## Install Meteorite
```
$ npm install -g meteorite
```

## Install leaflet
```
$ mrt add leaflet
```

## Download the last version on mappingparty
```
$ git clone git://github.com/ViGLug/mappingparty
$ cd mappingparty/src
$ meteor #default port is 3000, use --port <port> to change it
```

## Set up an auto update test enviroment

Run the service in background with screen:
```
$ cd ~/mappingparty/src
$ screen -S meteor
$ meteor
```
Than press ```Ctrl+a``` and then press ```d``` to detach screen and leave ti work in backgroud


Run the git auto update in background with screen, this auto-update che project folder every minute:
```
$ cd ~/mappingparty
$ screen -S updater
$ watch -n 60 git pull
```
Than press ```Ctrl+a``` and then press ```d``` to detach screen and leave ti work in backgroud

To go back to screens use:

```
$ screen -r meteor
```

or

```
$ screen -r updater
```
