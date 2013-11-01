#!/usr/bin/env node

'use strict';

var program = require('commander');
//var async = require('async');

require('colors');

var helpText;

var me = module.exports = {

    init: function() {


        program
            .version('0.0.1')
            .usage('[command] [options] <main javascript file>')
            .option('-w, --workers <n>', 'Number of worker processes to start', parseInt)
            .option('-i, --ipc <file>', 'Specifies the name of the IPC file (defaults to firestarter.ipc)')
            .option('-t, --timeout <n>', 'Set timeout (in seconds) for the operation')
            .option('-l, --log_dir <path>', 'Specifies the path to where you want the log files stored')
            .option('-s, --stdout <file>', 'Name of the STDOUT log file')
            .option('-e, --stderr <file>', 'Name of the STDERR log file')
            .option('-u, --username <user>', 'Username to switch to for each worker')
            .option('-g, --group <group>', 'Group to switch to for each worker')
            .option('--github_deploy', 'Does a "git pull", "npm install", then starts (or restarts) the workers')
            .option('--github_auto_deploy', 'Sets up hook to listen for github pushes, and auto deploys')
            .option('--github_hook <urlPath>', 'sets up a path to listen on for doing a github auto deploy')
            .option('--github_port <port>', 'sets the port to listen on for doing a github auto deploy')
            .option('--github_branch <branchName>', 'sets the name of the branch to listen for doing a github auto deploy')
            .option('--deploy_prelaunch <file>', 'executes a script before starting the workers')
            .option('--trigger <url>', 'URL to POST a status message on events')
            .option('--trigger_min <event>', 'Minimum exent that will cause a trigger (info, warn, error)')
            .option('--max_log_size <n>', 'Set the maximum log size')
            .option('--cwd <s>', 'Change directory before starting application')
            .option('--args <list>', 'Arguments to pass to each worker')
            .option('-v, --verbose', 'Verbose logging')
            .option('-vv, --veryverbose', 'Very verbose logging');

        program.on('--help', function() {
            if (!helpText) helpText = require('fs').readFileSync('./docs/helpText.txt');
            console.log(helpText.toString());
        });

        program.parse(process.argv);

        console.log(program.group)

        if (program.username && program.verbose) console.log('Workers will be started as user: '.green + program.username);
        if (program.group && program.verbose) console.log('Workers will be started as group: '.green + program.group);
    }

};

me.init();
