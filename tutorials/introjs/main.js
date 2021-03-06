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
var termkit = require('terminal-kit');
var term = termkit.terminal ;
var myChalk = require('./myChalk');

var intro = require('./intro');
var tutorial = require('./tutorial');
var _ = require('lodash');
var validCommands = require('./validCommands');

var log4js = require('log4js');

var appenders = [];

appenders.push({
    level: process.env.LOG_LEVEL || 'FATAL',
    'type': 'logLevelFilter',
    appender: {
        type: 'console'
    }
});


var logfile = process.env.LOG_FILE || path.join(__dirname, 'walkthrough.log');

appenders.push({
        type: 'file',
        filename: logfile,
        maxLogSize: 10000000,
        backups: 3
    }
);


if ( process.env.LOGENTRIES_TOKEN ){
    appenders.push(
        {
            level: 'DEBUG',
            'type': 'logLevelFilter',
            appender: {
                type: 'logentries-log4js-appender', options: {token: process.env.LOGENTRIES_TOKEN}
            }
        }
    )
}

log4js.configure({
    appenders: appenders
});

logger.debug('logging to file ', logfile);

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
        if ( port > 39000 || port < 32000 ){ // added lower limit per assi's request. 
            find_free_port();
        }else{
            logger.debug('found port', port);
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

    var stepCounter = -1;
    var commandAccomplished = false;
    var commandSkipped = false;

    function nextStep() {
        if (stepCounter + 1 < config.steps.length) {
            stepCounter++;
        }
        commandAccomplished = !getStep().command;

        setTimeout(run, 0);
    }

    function stepCallback(input) {
        //console.log('after run step', input);
        var step = getStep();
        if ( input === 'head' ){
            run();
        } else if (input === 'next') {
            if ( !commandAccomplished ){
                tutorial.confirmNext( config.confirm_next.trim() + ' ' , function( confirmed ){
                    if ( confirmed ){
                        commandSkipped = true;
                        nextStep();
                    }else{
                        prompt();
                    }
                } );
            }else {
                nextStep();
            }
        } else if ( input === 'clear'){
            run();
        }else if (input === 'restart') {
            intro.cleanup(config);
            intro.createWorkspaceFolder(config);
            stepCounter = -1;
            nextStep();
        } else if ( input === 'help' || input === 'commands' ){
            term(myChalk.brightGreen(config.help));
            prompt();
        }else if (input === 'exit') {
            tutorial.goodbye();
            process.exit(0);
        } else if (step.command === input) { // MUST COME BEFORE ALLOWED COMMANDS
            if ( commandSkipped ){
                tutorial.warnStepSkipped( myChalk.brightGreen(config.skip_warning) );
                prompt();
            }else {
                commandAccomplished = true;
                shell.exec(input, function () {
                    // shell will already print output
                    tutorial.summary(step, stepCallback);
                })
            }
        } else { // general command
            var commandValidity = validCommands.isValid(input);
            if ( commandValidity.valid ) {
                if ( input !== '' ) {
                    shell.exec(input, function () {
                        prompt();
                    });
                }else{
                    prompt();
                }
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

    nextStep();
}

setTimeout(function(){ // delay for splash screen
    if ( !data.port ) {
        events.on('port', main);
    }else {
        main();
    }
},parseInt(process.env.SPLASH_TIME || '3000',10));


// workaround to resolve an issue : https://github.com/paradoxxxzero/butterfly/issues/100
setTimeout(function(){ // add a workaround.. the process should get out within an hour by default..
    process.exit(0);
}, 60 * 60 * 1000);


