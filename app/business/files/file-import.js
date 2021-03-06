const path = require('path');


const models = require('../db/sqlite/models/All.js');
const auxFunc = require('../util/auxFunctions.js');
const ffmpeg = require('../ffmpeg/ffmpeg.js');
const log = require('../util/log.js');
const util = require('util');
const imageOp = require('../files/image-operations.js');
const fileOp = require('../files/file-operations.js');
var co = require('co');
var Sequelize = require('../db/sqlite/sequelize');

var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var fse = Promise.promisifyAll(require('fs-extra'));

var _ = require('lodash');


var videoExtentions = [".mp4", ".avi", ".mov", ".flv", ".rm", ".wmv", ".mov", ".m4v", ".mpg", ".mpeg", ".mkv", ".divx"];
var pictureExtentions = [".jpg", ".gif", ".png", ".bmp", ".jpeg", ".webm"];


var tagsArray = [];
var websitesArray = [];
var actorsArray = [];


var getModelArraySortedByLengthDsc = function (modelName) {
    return new Promise(function (resolve, reject) {
        let alias = modelName + 'Alias';
        models[modelName].findAll({
            include: [{model: models[alias], as: 'alias'}],
            order: [

                [Sequelize.sequelize.fn('length', Sequelize.sequelize.col(modelName + '.name')), 'DESC'],
                [{model: models[alias], as: 'alias'}, 'name', 'DESC']
            ]
        }).then(function (res, err) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })


};


var getAllModelsSortedByNameLengthDsc = function () {
    return new Promise(function (resolve, reject) {

        getModelArraySortedByLengthDsc('Website').then(function (websites) {

            websitesArray = websites;

            getModelArraySortedByLengthDsc('Actor').then(function (actors) {
                actorsArray = actors;

                getModelArraySortedByLengthDsc('Tag').then(function (tags) {
                    tagsArray = tags;
                    resolve("Loaded all models.");


                })


            })


        });

    });
};

var parseFileNameWrapper = co.wrap(function*(dbItem) {

    var pathToFile = dbItem.path_to_file;

    pathToFile = yield parseFileNameIntoTags(dbItem, websitesArray, "Website", pathToFile);
    pathToFile = yield parseFileNameIntoTags(dbItem, actorsArray, "Actor", pathToFile);
    pathToFile = yield parseFileNameIntoTags(dbItem, tagsArray, "Tag", pathToFile);

    return Promise.resolve(dbItem);


});


var addTagToDbItem = co.wrap(function*(dbItem, tagToAdd, tagToAddType) {
    var command = 'add' + tagToAddType;
    yield dbItem[command](tagToAdd);

});

var parseFileNameIntoTags = co.wrap(function*(dbItem, tagsToAddArray, tagsToAddType, currentPath) {


    let currentPathString = currentPath;
    for (let i = 0; i < tagsToAddArray.length; i++) {
        let currentTag = tagsToAddArray[i];
        let termsToSearch = [];
        var currentTagString = currentTag.name.trim();


        //if there are spaces in the tag
        if (currentTagString.indexOf(' ') != -1) {
            var currentTagSpaces = currentTagString.replace(/ /g, '.');
            termsToSearch.push(currentTagSpaces);
        } else {
            if (tagsToAddType == "Actor" && currentTag.is_exempt_from_one_word_search == false) {
                log.log(5, util.format("%s - '%s' is only one word and is not exempt from one word search ... skipping ", tagsToAddType, currentTag.name, dbItem.path_to_file), 'color: brown');
                continue;
            }
            termsToSearch.push(currentTagString);
        }


        if (currentTag["alias"] != undefined) {
            for (let i = 0; i < currentTag["alias"].length; i++) {
                var currentAlias = currentTag["alias"][i];
                currentAlias.name = currentAlias.name.trim();
                if (currentAlias.name.indexOf(' ') != -1) {
                    termsToSearch.push(currentTag["alias"][i].name.replace(/ /g, '.'))
                } else {
                    if (currentAlias.is_exempt_from_one_word_search) {
                        termsToSearch.push(currentTag["alias"][i].name)
                    }
                }
            }


        }

        for (let i = 0; i < termsToSearch.length; i++) {
            termsToSearch[i] = termsToSearch[i].replace(/\./g, '.{0,1}')
        }

        var found = false;
        for (let j = 0; j < termsToSearch.length && !found; j++) {
            // let rePattern = "/" + termsToSearch[j] + "/i";
            let pat = new RegExp(termsToSearch[j], "i");
            if (pat.test(currentPathString)) {
                found = true;

                // if (dbItem[tagsToAddType.toLowerCase() + 's'] == undefined) {
                //     dbItem[tagsToAddType.toLowerCase() + 's'] = [];
                // }
                //
                // let tagFoundInScene = false;
                //
                // let command = 'get' + tagsToAddType + 's';
                // let tagsInItemInDb = yield dbItem[command];


                // for (let i = 0; i < tagsInItemInDb.length && !tagFoundInScene; i++) {
                //     if (dbItem[tagsToAddType.toLowerCase() + 's'][i].name == currentTag.name) {
                //         tagFoundInScene = true;
                //     }
                // }

                if (!_.some(dbItem[tagsToAddType.toLowerCase() + 's'], ['name', currentTag.name])) {
                    yield addTagToDbItem(dbItem, currentTag, tagsToAddType);
                    // var command = add + tagsToAddType;
                    // dbItem[command](currentTag);
                    // dbItem[tagsToAddType.toLowerCase() + 's'].push(currentTag);
                    log.log(4, util.format("Added tag of type %s, name %s to item '%s'", tagsToAddType, currentTag.name, dbItem.path_to_file), 'colorWarn');
                } else {
                    log.log(4, util.format("%s - %s already found in scene %s", tagsToAddType, currentTag.name, dbItem.path_to_file), 'color: brown');
                }

                currentPathString = currentPathString.replace(new RegExp(termsToSearch[j], "ig"), "");

            }
        }

    }
    return currentPathString;

});

process.on('message', (m) => {

    process.send("This is child");
    process.send("Parsing Json");
    var tempObject =  JSON.parse(m);
    var dirObject = tempObject.dirObject;
    var message = tempObject.message;

    if (message == "walkPath"){
        process.send("message == walkPath");
        walkPath(dirObject);
    }else if (message == "rescanPath"){
        process.send("message == rescanPath");
        rescanFolderForTags(dirObject).then(function () {
            process.send("Finished reScanning Path")
        })
    }
    process.send("message is something else");
});

var walkPath = function walkPath(dirObject) {


        getAllModelsSortedByNameLengthDsc().then(function () {


                var addFolder = function (folderPath, lastFolderName, level, parent) {

                    return new Promise(function (resolve, reject) {

                        models.TreeFolder.findOrCreate({
                            include: [
                                {model: models.TreeFolder, as: 'parent'},
                                {model: models.TreeFolder, as: 'subFolders'}
                            ],

                            where: {
                                path_to_folder: folderPath,
                                name: folderPath,
                                last_folder_name: lastFolderName,
                                level: level
                            }

                        }).then(function (resFolder) {

                            if (resFolder[1]) {
                                log.log(4, util.format("Saved folder '%s' to db", resFolder[0].path_to_folder), 'colorWarn');

                                if (parent != null) {
                                    if (!_.some(parent.subFolders, ['id', resFolder[0].id])) {
                                        parent.addSubFolder(resFolder[0]).then(function (res) {
                                            log.log(4, util.format("added folder '%s' to folder's '%s' sub-folders", resFolder[0].path_to_folder, res.path_to_folder), 'colorWarn');

                                            resFolder[0].setParent(parent).then(function (res) {
                                                log.log(4, util.format("added folder '%s' as folder's '%s' parent", parent.path_to_folder, resFolder[0].path_to_folder), 'colorWarn');
                                                resolve(resFolder[0])
                                            })
                                        });

                                    }


                                } else {
                                    resolve(resFolder[0])
                                }

                            } else {
                                log.log(4, util.format("Folder '%s' already exists in db", resFolder[0].path_to_folder), 'colorWarn');
                                if (parent != null) {
                                    if (!_.some(parent.subFolders, ['id', resFolder[0].id])) {

                                        parent.addSubFolder(resFolder[0]).then(function (res) {
                                            log.log(4, util.format("added folder '%s' to folder's '%s' sub-folders", resFolder[0].path_to_folder, res.path_to_folder), 'colorWarn');

                                            if (!_.some(resFolder[0].parent, ['id', parent.id])) {

                                                resFolder[0].setParent(parent).then(function (res) {
                                                    log.log(4, util.format("added folder '%s' as folder's '%s' parent", parent.path_to_folder, resFolder[0].path_to_folder), 'colorWarn');
                                                    resolve(res)
                                                })

                                            } else {
                                                resolve(resFolder[0])
                                            }

                                        });

                                    } else {
                                        if (!_.some(resFolder[0].parent, ['id', parent.id])) {

                                            resFolder[0].setParent(parent).then(function (res) {
                                                log.log(4, util.format("added folder '%s' as folder's '%s' parent", parent.path_to_folder, resFolder[0].path_to_folder), 'colorWarn');
                                                resolve(res)
                                            })

                                        } else {
                                            resolve(resFolder[0])
                                        }

                                    }
                                } else {
                                    resolve(resFolder[0])
                                }

                            }


                        });

                        // models.TreeFolder.filter({path_to_folder: folderPath}).run().then(function (result) {
                        //     if (result.length == 0) {
                        //         var parsedPath = path.parse(folderPath);
                        //         var folderToAdd = new models.TreeFolder({
                        //
                        //             name: folderPath,
                        //             last_folder_name: lastFolderName,
                        //             path_to_folder: folderPath,
                        //
                        //             level: level,
                        //
                        //             sub_folders: []
                        //
                        //         });
                        //
                        //         folderToAdd.saveAll({sub_folders: true}).then(function (result) {
                        //
                        //
                        //             if (parent != null) {
                        //                 if (parent.sub_folders == undefined) {
                        //                     parent.sub_folders = [];
                        //                 }
                        //                 parent.sub_folders.push(result);
                        //                 parent.saveAll({sub_folders: true}).then(function (parentResult) {
                        //                     log.log(4, util.format("added folder '%s' to folder's '%s' sub-folders", result.path_to_folder, parentResult.path_to_folder), 'colorWarn');
                        //                     resolve(result)
                        //
                        //                 })
                        //             } else {
                        //                 resolve(result)
                        //             }
                        //         })
                        //     } else {
                        //         log.log(4, util.format("Folder '%s' already exists in db", result[0].path_to_folder), 'colorWarn');
                        //         resolve(result[0]);
                        //     }
                        // })
                    });
                };

                // make sure that upper folder exists

                var walkCo = co.wrap(function*(dir, parent, level) {


                    var dirs = yield fs.readdirAsync(dir);

                    for (let i = 0; i < dirs.length; i++) {
                        var file = path.join(dir, dirs[i]);
                        var stat = yield fs.statAsync(file);
                        if (stat && stat.isFile()) {
                            // console.log(file + " is file");
                            let ext = path.extname(file);

                            if (dirObject.is_video && videoExtentions.indexOf(ext.toLowerCase()) !== -1) {
                                yield addFile(file, 'Scene', parent)
                            }
                            if (dirObject.is_picture && pictureExtentions.indexOf(ext.toLowerCase()) !== -1) {
                                yield addFile(file, 'Picture', parent)
                            }
                        } else {
                            console.log(file + " is dir");
                            let splitPath = file.split(path.sep);
                            var newParent = yield addFolder(file, splitPath[splitPath.length - 1], level, parent);
                            yield walkCo(file, newParent, level + 1);
                        }
                    }
                    return Promise.resolve();

                });

                // Function start point
                co(function*() {

                    var splitPath = dirObject.path_to_dir.split(path.sep);

                    var test = splitPath[0];

                    var parent = yield addFolder(test, test, 0, null);
                    let level = 1;

                    // Ensures that base level folders exist.
                    for (let i = 1; i < splitPath.length; i++) {
                        test = path.join(test, splitPath[i]);
                        parent = yield addFolder(test, splitPath[i], level, parent);
                        level++;
                    }
                    // Walk path
                    yield walkCo(dirObject.path_to_dir, parent, level);

                    log.log(3, util.format("Finished walking folder '%s'", dirObject.path_to_dir), 'colorSuccess');
                    process.send('job finished');
                    console.log('\u0007');

                });

                var addFile = co.wrap(function*(fileToAddPath, fileToAddType, parent) {

                    // var fileInDb = yield models[fileToAddType].filter({path_to_file: fileToAddPath});

                    let parsedPath = path.parse(fileToAddPath);
                    var fileInDb = yield models[fileToAddType].findOrCreate({
                        include: [
                            {model: models.Actor, as: 'actors'},
                            {model: models.Tag, as: 'tags'},
                            {model: models.Website, as: 'websites'}

                        ],

                        where: {
                            name: parsedPath.name,
                            path_to_file: fileToAddPath,
                            path_to_dir: parsedPath.dir

                        }

                    });

                    var fileToAdd = fileInDb[0];
                    if (fileInDb[1]) {
                        // console.log("File with path %s is already in the database ...",fileToAddPath);
                        if (fileToAddType == "Scene") {

                            log.log(5, util.format("Trying to get ffprobe info for file '%s'", fileToAddPath), 'colorOther');
                            var probeInfo = null;
                            try {
                                probeInfo = yield ffmpeg.getProbeInfo(fileToAddPath)
                            } catch (e) {
                                log.log(0, util.format("Got error in ffprobe '%s' skipping file '%s'", e, fileToAddPath), 'colorError');
                                Promise.resolve('Skipping To Next Scene');
                                return;
                            }


                            let duration = Math.round(probeInfo.streams[0].duration);
                            let framerate = eval(probeInfo.streams[0].avg_frame_rate);

                            if (isNaN(duration)) {
                                duration = null;
                            }

                            if (isNaN(framerate)) {
                                framerate = null;
                            }
                            fileToAdd.codec_name = probeInfo.streams[0].codec_name;
                            fileToAdd.bit_rate = probeInfo.streams[0].bit_rate;
                            fileToAdd.duration = duration;
                            fileToAdd.size = probeInfo.format.size;
                            fileToAdd.framerate = framerate;
                            fileToAdd.width = probeInfo.streams[0].width;
                            fileToAdd.height = probeInfo.streams[0].height;

                            fileToAdd.thumbnail = undefined;
                            try {
                                // savedFile = yield ffmpeg.takeScreenshot(savedFile);
                                var thumbPath = yield ffmpeg.takeScreenshot(fileToAdd);

                                try {

                                    yield imageOp.resizeImage(thumbPath, 360);
                                    fileToAdd.thumbnail = thumbPath;
                                } catch (e) {
                                    log.log(3, util.format("Got error while trying to generate thumb image for scene '%s' Error:%s ", fileToAdd.name, e.message))


                                }


                                log.log(4, util.format("Took screenshot of file '%s'", fileToAdd.path_to_file), 'colorWarn');
                            } catch (error) {
                                log.log(0, util.format("Got Error when trying to take screenshot of file '%s' Error: '%s'", fileToAdd.path_to_file, error), 'colorError');
                                Promise.resolve('finished-adding-scene');
                                return;

                            }

                        }

                        if (fileToAddType == "Picture") {


                            var dirToCreatePath = path.join(auxFunc.appRootDir, 'media', 'pictures');
                            fileOp.createFoldersForPath(dirToCreatePath);
                            var saveFilename = path.join(dirToCreatePath, fileToAdd.id.toString() + '.jpg');

                            var ext = path.extname(fileToAdd.path_to_file);
                            // Jimp doesn't support gifs and webms so if we get an animated file we just skip fetching file info and creating a small thumb
                            if (ext.toLowerCase() != ".gif" && ext.toLowerCase() != ".webm" ){
                                try {

                                    var imageProp = yield imageOp.getImageDimentionsAndCreateThumbnail(fileToAdd.path_to_file, saveFilename, 360);

                                    fileToAdd.width = imageProp.width;
                                    fileToAdd.height = imageProp.height;
                                    fileToAdd.megapixels = (imageProp.width * imageProp.height) / 1000000;
                                    fileToAdd.thumbnail = saveFilename;


                                } catch (e) {
                                    log.log(0, util.format("Got error in Jimp '%s' skipping file '%s'", e, fileToAddPath), 'colorError');
                                    Promise.resolve('Skipping To Next Scene');
                                    return;
                                }
                            }



                        }


                        var taggedFile = yield parseFileNameWrapper(fileToAdd);

                        fileToAdd = yield fileToAdd.save();

                        log.log(4, util.format("Saved tagged file %s", fileToAdd.path_to_file), 'colorOther');
                    } else {


                        log.log(4, util.format("File %s already exists ...", fileToAddPath), 'colorOther');
                    }


                });


            }
        )
        ;
    }
    ;


var rescanFolderForTags = function (dirObject) {

    return new Promise(function (resolve, reject) {

        co(function*() {

            process.send(" Starting rescan of items in folder");

            log.log(4, util.format("Starting rescan of items in folder '%s'", dirObject.path_to_dir), 'colorOther');


            log.log(4, util.format("Loading Actor,Tag and Website models ..."), 'colorWarn');
            yield getAllModelsSortedByNameLengthDsc();
            log.log(4, util.format("Done, Loading Actor,Tag and Website models ..."), 'colorSuccess');

            var pathString = dirObject.path_to_dir;

            function escapeRegExp(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }

            // pathString = "(?i)" + escapeRegExp(pathString);

            log.log(4, util.format("Loading items in folder ..."), 'colorWarn');

            var allScenes = [];

            if (dirObject.is_video) {
                var temp = yield models.Scene.findAll({
                    include: [
                        {model: models.Actor, as: 'actors'},
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites'}

                    ],
                    where: {
                        path_to_dir: {
                            $like: '%' + pathString + '%'
                        }
                    }
                });

                allScenes = allScenes.concat(temp);
            }

            if (dirObject.is_picture) {
                var temp = yield models.Picture.findAll({
                    include: [
                        {model: models.Actor, as: 'actors'},
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites'}

                    ],
                    where: {
                        path_to_dir: {
                            $like: '%' + pathString + '%'
                        }
                    }
                });

                allScenes = allScenes.concat(temp);
            }

            // var allScenes = yield models[]

            // var allScenes = yield models[dirObject.media_type].getJoin({
            //     actors: true,
            //     tags: true,
            //     websites: true
            // }).filter(function (test) {
            //     return test("path_to_dir").match(pathString)
            // }).orderBy('path_to_file');
            log.log(4, util.format("Done ..."), 'colorSuccess');


            log.log(4, util.format("Starting rescan ..."), 'colorWarn');
            for (let i = 0; i < allScenes.length; i++) {
                log.log(4, util.format("Scanning item %s out of %s", i + 1, allScenes.length), 'colorWarn');
                process.send("Scanning item" + (i + 1) +" Out of " + allScenes.length );
                var itemBeforeParsing = _.cloneDeep(allScenes[i]);
                var parsedItem = yield parseFileNameWrapper(allScenes[i]);

                //
                // if (!_.isEqual(itemBeforeParsing, parsedItem)) {
                //
                //     var savedItem = yield parsedItem.save();
                //     log.log(4, util.format("Item '%s' was updated", savedItem.path_to_file), 'colorWarn');
                // }
            }
            process.send('job finished');
            resolve();


        });


    });


};


module.exports.walkPath = walkPath;
module.exports.rescanFolderForTags = rescanFolderForTags;

