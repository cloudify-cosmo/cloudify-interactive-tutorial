'use strict'


// regex of allowed commands
var _ = require('lodash');
var logger = require('log4js').getLogger('validCommands');

function general( input ){
    logger.trace('testing general commands');
    if ( /[;,&&,||]/.test(input) ){ // check if trying to hack us
        return { valid : false, reason : 'operator not allowed'};
    }
    return {valid:true};
}

function isValidPath( path ){
    logger.trace('validating path',path);
    return path.indexOf('..') < 0 &&
    !path.startsWith('/')  &&
    path.indexOf('~') !== 0;
}


function testPathCommand( prefix, reason ){
    return function(input){
        logger.trace('checking ' + prefix + ' command');
        if ( input.trim().startsWith(prefix) ){
            var path = input.split(' ')[1];
            if ( !isValidPath(path) ){
                return { valid: false, reason: reason}
            }
        }
        return {valid:true};
    }
}

var lsCommand = testPathCommand('ls','cannot list this folder');
var catCommand = testPathCommand('cat','cannot cat this file');

function allowedCommand( input ){
    logger.trace('testing allowed commands');
    if ( [ '','cat', 'ls', 'cfy' ].indexOf(_.first(input.split(' '))) < 0 ){
        return {valid:false, reason: 'command is not allowed'}

    }
    return {valid:true}
}


var validators = [
    general,
    allowedCommand,
    lsCommand,
    catCommand
     ];

exports.isValid = function( command ){
    var _result = { valid : true };
    _.find(validators, function(v){
        try {
            var result = v(command);
            if (!result.valid) {
                logger.trace('found invalidity. failing on ', result);
                _result = result;
                return true;
            }
        }catch(e){ logger.trace(e);}
    });
    _result.command = command;
    return _result;
};

if ( require.main === module ){
    var input = process.argv[2];
    logger.info('testing ', input);
    console.log(exports.isValid( input ));
}