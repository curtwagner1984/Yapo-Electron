var Jimp = require('jimp');
var path = require('path');
var util = require('util');
var log = require('../util/log.js');
var fileOp = require('../files/file-operations');

var resizeImage = function (srcPath, resizePxWidth, dscPath) {

    return new Promise(function (resolve, reject) {

        if (dscPath == undefined){
            var savePath = fileOp.getSmallPath(srcPath, resizePxWidth);    
        }else{
            var savePath = fileOp.getSmallPath(dscPath, resizePxWidth);
        }
        

        Jimp.read(srcPath).then(function (image) {
            image.resize(resizePxWidth, Jimp.AUTO).quality(60).write(savePath, function (err) {
                if (err){
                    reject(err)
                }else{
                    log.log(4,util.format("Saved file '%s'",savePath));
                    resolve();
                }

            });


        }).catch(function (err) {
            console.log(err);
            reject(err)
        })

    })



};



module.exports.resizeImage = resizeImage;