


exports.close = '\033[0m';

exports.brightGreen = function(str){
  return    exports.brightGreen.open + str + exports.close;
};

//exports.brightGreen.open = '\033[1;34m';
exports.brightGreen.open = '\033[0;92m';

exports.brightBlue = function(str){
    return exports.brightBlue.open  + str + exports.close;
};

exports.brightBlue.open = '\033[1;34m';