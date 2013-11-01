
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var status = {
	  starting 		: 1
	, listening 	: 2
	, online 		: 4
	, offline 		: 8
	, ping 			: 4096
	, pong 			: 8192
};

var sizeOf = function(obj){
	var count = 0;
	for(var key in obj) {
		if(obj.hasOwnProperty(key)) {
			count++;
		}
	}
	return count;
};

module.exports = function(userConfig){
	'use strict';

	var processStatus = {};

	userConfig = userConfig || {};
	numCPUs = userConfig.numCPUs || numCPUs;
	var shutdown = false;

	var newWorker = function(){

		if(shutdown){
			console.log('Not starting worker, as system shutting down');
			return;
		}

		var worker = cluster.fork();

		processStatus[worker.process.pid] = {};
		processStatus[worker.process.pid].status = status.starting;
		processStatus[worker.process.pid].check = status.starting;
		processStatus[worker.process.pid].startTime = new Date();
		
		console.log('New worker created: ' + worker.process.pid);

		worker.on('message', function(msg){
			
			if(msg ==='pong'){
				processStatus[worker.process.pid].check = status.pong;
			} else if(msg === 'offline'){
				console.log('Worker [PID:'+worker.process.pid+'] going offline');
				processStatus[worker.process.pid].status = status.offline;
				worker.disconnect();
				newWorker();
			}
		});
	};

	

	var fn = {

		startup : function(init, onShutdown, onReady){

			if(cluster.isMaster) {

				process.on('SIGINT', function() {
					console.log('');
					console.log('FireStarter Cluster - Received shutdown message from SIGINT (ctrl+c)');
					process.exit(0);
				});

				for( var instance = 0; instance < numCPUs; instance++){
					newWorker();
				}

				cluster.on('exit', function(worker, code, signal){
					console.log('Worker [PID:'+worker.process.pid+'] died with code '+code+' and signal '+signal);
					if(processStatus[worker.process.pid].status !== status.offline){
						console.log('Process should have been offline, but wasn\'t - starting new....');
						newWorker();
					}
					processStatus[worker.process.pid] = null;
					delete processStatus[worker.process.pid];
				});

				cluster.on('online', function(worker){
					console.log('Worker [PID:'+worker.process.pid+'] is now online');
					processStatus[worker.process.pid].status = status.online;
				});

				cluster.on('listening', function(worker, address) {
					console.log('Worker [PID:'+worker.process.pid+'] is now connected to ' + address.address + ':' + address.port);
					processStatus[worker.process.pid].status = status.listening;
					processStatus[worker.process.pid].check = status.pong;
				});

				var showStats = function(){
					setTimeout(function(){
						console.log('Workers online: ' + processStatus.length + '/' + numCPUs);
						showStats();
					}, 5000);
				};

				showStats();

			} else {

				require('../firestarter')(userConfig.firestarter)
					.startup(init, onShutdown, onReady);
			}
		}
	};
	return fn;
};
