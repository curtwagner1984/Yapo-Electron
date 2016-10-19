const exec = require('child_process').exec;
const auxFunc = require('./auxFunctions');
const vlcPath = "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe";

var playVlc = function (scene) {
    let vlcCommand = auxFunc.padQuotes(vlcPath) + " " + auxFunc.padQuotes(scene.path_to_file);
    var vlc = exec(vlcCommand, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);


        if (error !== null) {
            console.log('exec error: ' + error);
          
        }


    });
};

module.exports.playVlc = playVlc;