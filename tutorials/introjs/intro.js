//'use strict';

var freeport = require('freeport');
var shelljs = require('shelljs/global');
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var YAML = require('yamljs');
var myChalk = require('./myChalk');


var logger = require('log4js').getLogger('intro');

exports.getFreePort = freeport;

//http://stackoverflow.com/a/5048433
exports.killProcessByPort = function (port) { // we don't care about callbacks..
    exec('fuser -k -TERM -n tcp ' + port);
};

/**
 *
 * @param {WalkthroughData} data
 * @returns {string}
 */
exports.getWorkspaceFolder = function (data) {
    return path.join(data.root, '../workspace', 'blueprint_' + data.port);
};

/**
 *
 * @param {WalkthroughData} data
 */
exports.createWorkspaceFolder = function (data) {
    logger.info('creating worksapce folder');
    var workspace = exports.getWorkspaceFolder(data);
    fs.copySync(data.root, workspace);
    process.chdir(workspace);
};

exports.deleteWorkspaceFolder = function (data) { // do not care about sync
    console.log('deleting workspace');
    fs.removeSync(exports.getWorkspaceFolder(data));
};

exports.cleanup = function( data ){
    return function(){
        exports.deleteWorkspaceFolder(data);
        exports.killProcessByPort(data.port);
    }
};

exports.readConfig = function( data ){
    logger.info('reading configuration');
    var config = YAML.load(data.configFile);

    _.each(config.steps, function(s, index){
        try {
            if (s.command) {
                s.command = s.command.replace('__port__', data.port);
                s.command = s.command.replace('__ip__', process.env.EXTERNAL_IP);
            }


            s.summary = myChalk.brightGreen( (s.summary ? s.summary : '') + '\nEnter "next" to continue...' );


            s.intro = myChalk.brightGreen.open + s.intro.replace('{0}',
                myChalk.brightBlue.open + s.command + myChalk.brightGreen.open) + myChalk.close;
        }catch(e){
            logger.error('error while manipulating configuration for step', index);
            throw e;
        }

    });
    return config;
};

exports.registerCleanup = function(data){
    logger.info('registering cleanup');
    function exitHandler(options, err) {

        if ( options.cleanup ){
            logger.debug('cleaning up port', data.port);
            exports.killProcessByPort(data.port);
            exports.deleteWorkspaceFolder(data);
        }else{
            logger.debug('not cleaning up');
        }
        if (err) {
            console.log('error happened' , err.stack);
        }
        if (options.exit){
            process.exit();
        }
    }

//do something when app is closing
    process.on('exit', exitHandler.bind(null, {cleanup:true, exit: true}));

//catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {cleanup: true, exit:true}));

};



