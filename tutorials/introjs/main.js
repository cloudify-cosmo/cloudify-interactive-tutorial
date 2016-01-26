#!/usr/bin/env node

'use strict';

/**
 *
 * @typedef {object} WalkthroughData
 * @property {string} myPath
 * @property {string} myDir
 * @property {string|number} port
 */


var path = require('path');
var freeport = require('freeport');
var logger = require('log4js').getLogger('main');
var shell = require('shelljs');

var intro = require('./intro');
var tutorial = require('./tutorial');
var _ = require('lodash');
var validCommands = require('./validCommands');

var log4js = require('log4js');

log4js.configure({
    levels: {
        "[all]" : process.env.LOG_LEVEL || "FATAL"
    }
});

try {
    if (process.argv[2] === 'motd') {
        console.log(path.join(__dirname,'../../conf/motd'));
        process.exit(0);
    }
}catch(e){}

/**
 *
 * @type WalkthroughData
 */
var data = {
    root: path.resolve(process.env.WALKTHROUGH_ROOT ||   path.join( __dirname, '../../dev/my_blueprint'  ) ), // support running the code from project root
    port: null,
    configFile: path.join(__dirname, 'config.yaml')
};

var Events = require('events');
var events = new Events();





function find_free_port() {
    freeport(function (err, port) {
        if (err) throw err;
        if ( port > 39000 ){
            find_free_port();
        }else{
            data.port = port;
            events.emit('port');
        }

    });
}

find_free_port();

function main() {
    intro.createWorkspaceFolder(data);
    intro.registerCleanup(data);
    var config = intro.readConfig(data);

    var stepCounter = 0;

    function nextStep() {
        if (stepCounter + 1 < config.steps.length) {
            stepCounter++;
        }
        setTimeout(run, 0);
    }

    function stepCallback(input) {
        //console.log('after run step', input);
        var step = getStep();
        if (input === 'next') {
            nextStep();
        } else if (input === 'restart') {
            main();
        } else if (input === 'exit') {
            tutorial.goodbye();
            process.exit(0);
        } else if (step.command === input) { // MUST COME BEFORE ALLOWED COMMANDS
            shell.exec(input, function () {
                // shell will already print output
                tutorial.summary(step, stepCallback);
            })
        } else { // general command
            var commandValidity = validCommands.isValid(input);
            if ( commandValidity.valid ) {
                shell.exec(input, function () {
                    prompt();
                });
            }else{
                tutorial.notAllowed(commandValidity.reason);
                prompt();
            }
        }
    }

    function getStep() {
        return config.steps[stepCounter];
    }

    function run() {
        tutorial.runStep(getStep(), stepCallback);
    }

    function prompt() {
        tutorial.prompt(getStep(), stepCallback);
    }

    run();
}

setTimeout(function(){ // delay for splash screen
    if ( !data.port ) {
        events.on('port', main);
    }else {
        main();
    }
},parseInt(process.env.SPLASH_TIME || '3000',10));





