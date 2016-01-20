
var shelljs = require('shelljs');
var logger = require('log4js').getLogger('cfyAutocomplete');
var _ = require('lodash');
var path = require('path');
var fs = require('fs-extra');

exports.autocomplete = function(str, callback ){

    var script = path.join(__dirname, 'autocomplete_script.sh' );
    var outputFile = path.join(process.cwd(), 'autocomplete_output' );

    shelljs.exec(script + ' \"' + str + '\"', function(){

        var content = fs.readFileSync(outputFile).toString();
        //console.log('this is content',content);
        //fs.removeSync(outputFile);

        var result = _.map(content.split('\u000b'), function(a){
            return a.trim();
        });

        //console.log(result);

        callback( result );
    });

};


if ( require.main === module ){
    exports.autocomplete(process.argv[2], function( result ){
        console.log('result is ', result);
    })
}


