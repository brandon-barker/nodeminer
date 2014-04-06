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

Clone the project

```
git clone git@github.com:brandon-barker/nodeminer.git nodeminer
```

Install dependencies 

```
npm install
bower install 
```

Run the project 

```
grunt serve
```

#### Production

Coming soon...

## Screenshots

![Dashboard](http://i.imgur.com/iPLqbR9.png)

![Dashboard (collapsed)](http://i.imgur.com/Gp23Tf5.png)

## Donate ;)

Development for nodeminer is done in my spare time, if you appreciate my efforts and would like to donate please see below:

**BTC**: 17tQq3mSePUSGZcNzC66ZEK4wkSj2ayM2w
**LTC**: LN2t5RXkTZCJLv7fNsUm77gFZmzob1yHiL
