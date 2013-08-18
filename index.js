
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

module.exports = function(userConfig){
	'use strict';

	userConfig = userConfig || {};
	numCPUs = userConfig.numCPUs || numCPUs;
	var shutdown = false;

	var newWorker = function(){
		if(shutdown){
			console.log('Not starting worker, as system shutting down');
			return;
		}
		var worker = cluster.fork();
		console.log('New worker created: ' + worker.process.pid);
		worker.on('message', function(msg){
			if(msg === 'offline'){
				console.log('Worker [PID:'+worker.process.pid+'] going offline');
				worker.disconnect();
				newWorker();
			}
		});
	};

	var fn = {

		start : function(init, onShutdown, onReady){

			if(cluster.isMaster) {

				for( var instance = 0; instance < numCPUs; instance++){
					newWorker();
				}

				cluster.on('exit', function(worker, code, signal){
					console.log('Worker [PID:'+worker.process.pid+'] died with code '+code+' and signal '+signal);
				});

				cluster.on('online', function(worker){
					console.log('Worker [PID:'+worker.process.pid+'] is now online');
				});

				cluster.on('listening', function(worker, address) {
					console.log('Worker [PID:'+worker.process.pid+'] is now connected to ' + address.address + ':' + address.port);
				});

				var showStats = function(){
					setTimeout(function(){
						console.log('Workers online: '+cluster.workers.length+'/'+numCPUs);
						showStats();
					}, 5000);
				};

				showStats();

			} else {

				require('firestarter')(userConfig.firestarterConfig)
					.startup(init, onShutdown, onReady);
			}
		}
	};
	return fn;
};
