const path = require('path');
const util = require('util');
const auxFunc = require('../util/auxFunctions.js');
const log = require('../util/log.js');
const exec = require('child_process').exec;
var fs = require('fs');
var fse = require('fs-extra');
var ffmpegPath = path.join(auxFunc.appRootDir, 'bin', 'ffmpeg', 'ffmpeg');
var ffprobePath = path.join(auxFunc.appRootDir, 'bin', 'ffmpeg', 'ffprobe');
const imageOp = require('../files/image-operations.js');

// function getffmpegPath() {
//
//     var pCheck = path.join(__dirname, '..', '..', 'bin', 'ffmpeg');
//     ffmpegPath = path.join(pCheck, 'ffmpeg');
//     ffprobePath = path.join(pCheck, 'ffprobe');
//
//
// }
//
// getffmpegPath();


var getProbeInfo = function (pathToFile) {

    return new Promise(function (resolve, reject) {

        let ffprobeCommand = util.format('%s -v error -show_entries format=size,duration,bit_rate -select_streams v:0 ' +
            '-show_entries stream=codec_name,width,height,avg_frame_rate,duration,bit_rate ' +
            '-of default=noprint_wrappers=1 -print_format json %s', auxFunc.padQuotes(ffprobePath), auxFunc.padQuotes(pathToFile));

        var ffprobeJson = "";
        var fFmpegError = false;


        exec(ffprobeCommand, function (error, stdout, stderr) {
            try {
                ffprobeJson = JSON.parse(stdout);
            } catch (err) {
                reject(err);
                fFmpegError = true;
            }


            if (!fFmpegError) {
                if (error !== null) {
                    console.error('exec error: ' + error);
                    reject(error);
                }
                resolve(ffprobeJson);
            }


        });

    });


};

var takeScreenshot = function (scene) {
    return new Promise(function (resolve, reject) {

        let tenPercentMark = Math.round(0.1 * scene.duration);


        let dirToCreatePath = path.join(auxFunc.appRootDir, 'media', 'scenes', scene.id.toString(), 'screenshot');

        fse.mkdirs(dirToCreatePath, function (err) {
            if (err) {
                reject(err);
                return console.error(err);
            }

            let outputName = path.join(dirToCreatePath, 'thumb.jpg');

            let ffmpegCommand = util.format("%s -xerror -n -v error -ss %s -i %s -vf thumbnail,scale=1280:720,pad=ih*16/9:ih:(ow-iw)/2:(oh-ih)/2 -frames:v 1 -q:v 7 %s",
                auxFunc.padQuotes(ffmpegPath), auxFunc.timeSecondsToHHMMSS(tenPercentMark), auxFunc.padQuotes(scene.path_to_file)
                , outputName);


            log.log(5, util.format("Trying to take a thumbnail for scene '%s'", scene.name), 'colorOther');
            fs.stat(outputName, function (err, stat) {
                if (err == null) {
                    log.log(5, util.format("Thumbnail already exists!"), 'colorWarn');
                    reject(scene);

                } else if (err.code == 'ENOENT') {

                    var ffmpeg = exec(ffmpegCommand, function (error, stdout, stderr) {

                        if (stderr != "") {
                            console.log('stderr: ' + stderr);
                        }


                        if (error !== null) {
                            console.log('exec error: ' + error);
                            if (error.message.includes("already exists")) {
                                reject("Thumb already exists");
                            } else {
                                console.error(error);
                                reject(error);
                            }

                        }


                    });

                    ffmpeg.on('exit', function () {
                        // scene.thumbnail = outputName;
                        
                        resolve(outputName);
                        
                        // scene.save().then(function () {
                        //     resolve(scene);
                        // });

                    })

                } else {
                    console.log('Some other error: ', err.code);
                }
            });


        });

    });


};


module.exports.getProbeInfo = getProbeInfo;
module.exports.takeScreenshot = takeScreenshot;


