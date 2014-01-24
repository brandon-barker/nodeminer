'use strict';

angular.module('nodeminerApp')
    .controller('MinerCtrl', function ($scope, $http) {
        $scope.miners = [
            {
                name: 'Miner #1',
                numberOfDevices: '5',
                totalHashrate: '4.2 Mh/s',
                ipAddress: '192.168.0.100',
                rpcPort: 4028,
                miner: 'bfgminer',
                devices: [
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'DogeCoin',
                        'pool': 'doge.dedicatedpool.com',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'DogeCoin',
                        'pool': 'doge.dedicatedpool.com',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'DogeCoin',
                        'pool': 'doge.dedicatedpool.com',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'DogeCoin',
                        'pool': 'doge.dedicatedpool.com',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'DogeCoin',
                        'pool': 'doge.dedicatedpool.com',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    }
                ],
                notifications: {
                    count: 3,
                    list: []
                },
                showDetails: false
            },
            {
                name: 'Miner #2',
                numberOfDevices: '5',
                totalHashrate: '4.31 Mh/s',
                ipAddress: '192.168.0.200',
                rpcPort: 4028,
                miner: 'bfgminer',
                devices: [
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'HashCows',
                        'pool': 'hashco.ws',
                        'temperature': '74C',
                        'fan': '80%',
                        'hashrate': '730kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '14.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.09v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'HashCows',
                        'pool': 'hashco.ws',
                        'temperature': '72C',
                        'fan': '75%',
                        'hashrate': '724kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.085v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'HashCows',
                        'pool': 'hashco.ws',
                        'temperature': '73C',
                        'fan': '75%',
                        'hashrate': '731kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'HashCows',
                        'pool': 'hashco.ws',
                        'temperature': '75C',
                        'fan': '75%',
                        'hashrate': '722kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    },
                    {
                        'enabled': true,
                        'name': 'AMD Radeon R9 200 Series',
                        'coin': 'HashCows',
                        'pool': 'hashco.ws',
                        'temperature': '71C',
                        'fan': '75%',
                        'hashrate': '720kh/s',
                        'shares': {
                            accepted: 521,
                            rejected: 10
                        },
                        'utility': '12.1',
                        'intensity': '13',
                        'gpuClock': '1050',
                        'gpuMemory': '1500',
                        'voltage': '1.1v'
                    }
                ],
                notifications: {
                    count: 0,
                    list: []
                },
                showDetails: false
            }
        ]

        $scope.toggleMinerDetails = function (miner)
        {
            miner.showDetails = !miner.showDetails;
        }
    });