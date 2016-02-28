'use strict';

var termkit = require('terminal-kit');
var term = termkit.terminal ;
var myChalk = require('./myChalk');
var cfyAutocomplete = require('./cfyAutocomplete');
var async = require('async');
var fs = require('fs');
var _ = require('lodash');
var logger = require('log4js').getLogger('tutorial');

var autocomplete = function (step) {
    return function (inputString, callback) {

        var options = [];

        async.waterfall([
            function addCommand(_done) {
                if (step && step.command && step.command.indexOf(inputString.trim()) === 0) {
                    options.push(step.command);
                }
                _done();
            },
            function addGlobalCommands(_done){
                var filteredOptions = _.filter(['next', 'restart', 'exit', 'head'], function(o){return o.indexOf(inputString.trim())=== 0});
                //console.log('filtered options', filteredOptions);
                options = options.concat( filteredOptions );
                _done();
            },
            function getCfyAutocompletion(_done) {
                if (inputString && inputString.trim().indexOf('cfy') === 0) {

                    cfyAutocomplete.autocomplete(inputString, function (output) {
                        try {
                            if (output && output.length > 0) {
                                var lastArg = _.last(inputString.split(' '));

                                output = _.map(output, function(o){
                                    var value = inputString + ' ' + o;
                                    if (o.indexOf(lastArg) === 0){
                                        value = inputString.substring(0, inputString.length - lastArg.length) + o;
                                    }
                                    return value;
                                });
                                options = options.concat(output);
                            }
                        } finally {
                            _done();
                        }

                    });

                }else {
                    _done();
                }
            },
            function getFilesAutocomplete(_done) {
                if ( inputString.indexOf('ls') === 0 ) {
                    fs.readdir(process.cwd(), function (error, files) {
                        options = options.concat(files);
                        _done();
                    });
                }else{
                    _done();
                }
            }
        ], function () { // finished all
            //console.log('autocomplete options are', JSON.stringify(options));
            //console.log('this is options', );
            //console.log('options is', options);
            try {
                callback(undefined, termkit.autoComplete(_.compact(options), inputString, true));
            }catch(e){
                console.log('error on options', options, error);
                throw e;
            }
        });
    }


};

var history = [ ] ;

exports.prompt = function( step, callback ){

    term('cfy $ ');
    term.inputField(
        { history: history, autoComplete: autocomplete(step), autoCompleteMenu: true},
        function (error, input) {
            history.push(input);
            console.log('');
            if ( error ){
                logger.error('unable to get input', error);
            }
            callback(input);
        }
    );
};


exports.confirmNext = function( str, callback ){
    term(str);
    term.inputField({
        autoComplete: ['Y','N'],
        autoCompleteMenu: true
    }, function(error,input){
        try {
            term('\n');
            callback( input.toLowerCase() === 'y' );

        }catch(e){
            callback(false);
        }
    })

};

exports.warnStepSkipped = function( str ){
    term('\n\n\n' + str + '\n\n\n');

};

exports.summary = function( step, callback ){
    term('\n\n\n' + step.summary + '\n\n\n');
    exports.prompt( step, callback )
};

/**
 *
 * @param {object} step
 * @param {string} step.command
 * @param {string} step.intro
 * @param {function(input)} callback
 */
exports.runStep = function( step, callback ){
    if ( !process.env.SKIP_RESET ) {
        logger.debug('skipping reset');
        term.reset();
    }
    term( step.intro  + '\n\n\n');
    exports.prompt( step, callback );


    // my slow typing implementation as the built in one does not work properly due to color issue

    //var lines = step.intro.split('\n');
    //var counter = 0;
    //var leaps = 1;
    //function slowType(){
    //    if ( counter >= lines.length ){
    //        exports.prompt(step,callback);
    //    }else{
    //        term(lines[counter] + '\n');
    //        counter = counter + leaps;
    //        setTimeout(slowType,200);
    //    }
    //}
    //
    //setTimeout(slowType,3);
};

exports.notAllowed = function( reason ){
    term.brightRed( ( reason || 'operation not allowed.') + '\n');
};

exports.goodbye = function(){
    term( myChalk.brightGreen('Please come again!!\n'));
};