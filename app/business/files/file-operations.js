var req = require('request');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var util = require('util');
var download = function (url, dest) {
    return new Promise(function (resolve, reject) {

        try {
            var stats = fs.statSync(dest);
            console.log("file already exists");
            resolve();


        } catch (e) {
            if (e.code == "ENOENT") {

                var file = fs.createWriteStream(dest);
                // req(url).pipe(file);

                req.get(url).on('error', function (err) {
                    console.log(err);
                    reject()
                }).pipe(file);

                file.on('finish', function () {
                    file.close();  // close() is async, call cb after close completes.
                    resolve();
                });

                file.on('error', function (err) {
                    file.close();  // close() is async, call cb after close completes.
                    console.log(err);
                    reject();
                });

            } else {
                throw e;
            }
        }


    });

};

var createFoldersForPath = function (path) {

    return new Promise(function (resolve, reject) {
        fse.mkdirs(path, function (err) {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                resolve();
            }
        })

    });

};


var getSmallPath = function (srcPath, smallImagePixelWidth) {
    var ext = path.extname(srcPath);
    var baseName = path.basename(srcPath, ext);
    var parsedPath = path.parse(srcPath);
    return path.join(parsedPath.dir, baseName + util.format("_%s%s", smallImagePixelWidth, ext));
    
};

module.exports.download = download;
module.exports.createFoldersForPath = createFoldersForPath;
module.exports.getSmallPath = getSmallPath;







