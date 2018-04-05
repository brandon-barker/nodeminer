![nodeminer](http://i.imgur.com/G1qrh38.png)
============

## Purpose

nodeminer is a node.js based Web UI for mining scrypt based cryptocurrencies.

It allows you to manage multiple rigs in a single Dashboard and gives you the ability to completely control your cgminer / sgminer / bfgminer instances and configuration.

## Current Status

nodeminer is still in the early stages with a lot of features planned, it is currently in a usable state but not production ready as yet. 

See below for current features.

## Current Features

* Supports cgminer / sgminer / bfgminer
* Dashboard overview with mining stats (Total Accepted Shares / Rejected Shares / Reject Ratio / GPU Count / GPU Health Status etc) 
* Intuitive overview per mining rig displaying critical data such as Load, Temperature, Fan Speed, Hashrate, Shares, Work Utility, Intensity, GPU Clock, Memory Clock & Intensity
* Overclock your GPUs straight from the Dashboard
* Change Voltage & Intensity from the Dashboard 
* Zero Stats per Miner and/or globally
* Add/Edit Mining Pools and switch between them on the fly 
* Dynamically Add/Remove Mining Rigs to be monitored on the Dashboard

## Installation

#### Development

In order to build nodeminer, ensure that you have Git and Node.js installed.

Clone a copy of the nodeminer git repo:

```
git clone https://github.com/brandon-barker/nodeminer.git
```

Change to the nodeminer directory:

```
cd nodeminer
```

Install the grunt command-line interface globally:

```
npm install -g grunt-cli
```

Install project dependencies 

```
npm install
bower install 
```

Build & run the project

```
grunt serve
```

##### Accessing **nodeminer** outside of localhost

If you are hosting nodeminer on a box other than your local machine you will need to change line 2 in ```app/scripts/services/SocketIOSvc.js``` from 

```
var socket = io.connect('http://localhost:6895');
```

to 

```
var socket = io.connect('http://<your ip address>:6895');
```

#### Production

Coming soon...

## Screenshots

#### Dashboard
![Dashboard](http://i.imgur.com/iPLqbR9.png)

#### Dashboard (collapsed)
![Dashboard (collapsed)](http://i.imgur.com/Gp23Tf5.png)
