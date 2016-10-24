const dir = require('node-dir');
const path = require('path');

const models = require('../db/models/all.js');
const thinky = require('../db/util/thinky.js');
const ffmpeg = require('../ffmpeg/ffmpeg.js');
const auxFunc = require('../util/auxFunctions.js');
const log = require('../util/log.js');
const util = require('util');

var co = require('co');
// var fs = require('fs');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');

const events = require('events');
var eventEmitter = new events.EventEmitter();

var videoExtentions = [".mp4", ".avi", ".mov", ".flv", ".rm", ".wmv", ".mov", ".m4v", ".mpg", ".mpeg", ".mkv", ".divx"];
var pictureExtentions = [".jpg", ".gif", ".png", ".bmp", ".jpeg", ".webm"];

var lastFilePath = "";

var folderToAddQueue = [];
var dirAndFiles = [];


var actorTagsArray = [];
var actorAliasArray = [];
var tagsArray = [];
var websitesArray = [];
var actorsArray = [];
var sceneArray = [];
var pictureTagsArray = [];

function processFolderQueue() {

    if (folderToAddQueue.length > 0) {
        let currentFolder = folderToAddQueue.shift();
        addTreeFolderToDb(currentFolder.currentPath, currentFolder.parentPath, currentFolder.level, currentFolder.lastFolderName, currentFolder.files);

    } else {
        log.log(3, util.format("Added All Folders"), 'colorSuccess');

    }


}


function parseFilenameForTags(itemToAdd, type) {
    return new Promise(function (resolve, reject) {

        let pathToFile = itemToAdd.path_to_file;
        let tagsToAddToSceneQueue = [];

        if (type == 'Video') {
            // parse websites
            pathToFile = parseTagsInPath(pathToFile, 'Website', websitesArray, 'website', 'websites', tagsToAddToSceneQueue);
            // parse actors
            pathToFile = parseTagsInPath(pathToFile, 'Actor', actorsArray, 'actor', 'actors', tagsToAddToSceneQueue);
            // parse sceneTags
            pathToFile = parseTagsInPath(pathToFile, 'SceneTag', sceneTagsArray, 'sceneTag', 'scene_tags', tagsToAddToSceneQueue);
            // parse actorTags
            pathToFile = parseTagsInPath(pathToFile, 'ActorTag', actorTagsArray, 'actorTag', 'actor_tags', tagsToAddToSceneQueue);
            // parse actorAlias
        }

        if (type == 'Picture') {
            pathToFile = parseTagsInPath(pathToFile, 'Website', websitesArray, 'website', 'websites', tagsToAddToSceneQueue);
            pathToFile = parseTagsInPath(pathToFile, 'Actor', actorsArray, 'actor', 'actors', tagsToAddToSceneQueue);
            pathToFile = parseTagsInPath(pathToFile, 'PictureTag', pictureTagsArray, 'pictureTag', 'picture_tags', tagsToAddToSceneQueue);
            pathToFile = parseTagsInPath(pathToFile, 'ActorTag', actorTagsArray, 'actorTag', 'actor_tags', tagsToAddToSceneQueue);

        }


        processTagsToAddToSceneQueue();

        // eventEmitter.on('added-tags-to-scene', processTagsToAddToSceneQueue);

        function processTagsToAddToSceneQueue() {

            if (tagsToAddToSceneQueue.length > 0) {
                let currentTag = tagsToAddToSceneQueue.shift();
                auxFunc.addTagToScene(itemToAdd, currentTag.modelToAddName, currentTag.tagTypeInScene, currentTag.tagToAddName, type).then(function (res) {
                    itemToAdd = res;
                    // eventEmitter.emit('added-tags-to-scene')
                    processTagsToAddToSceneQueue();
                })
            } else {
                log.log(5, util.format("Added All Tags To Scene '%s' ", itemToAdd.name), 'colorSuccess');
                resolve(itemToAdd)
            }

        }

    });


}

function parseTagsInPath(pathToFile, modelToAddName, tagsArray, tagType, tagTypeInScene, arrayOfTagsToAddToScene) {
    let currentPathString = pathToFile;
    for (let i = 0; i < tagsArray.length; i++) {
        let currentTag = tagsArray[i];
        let termsToSearch = [];
        var currentTagString = currentTag.name.trim();

        if (currentTagString.indexOf(' ') != -1) {
            var currentTagSpaces = currentTagString.replace(' ', '. *');
            var currentTagPeriod = currentTagString.replace(' ', '.');

            termsToSearch.push(currentTagPeriod);
            termsToSearch.push(currentTagSpaces);
        } else {
            if (modelToAddName == "Actor" && currentTag.is_exempt_from_one_word_search == false) {
                return currentPathString;
            }
            termsToSearch.push(currentTagString);
        }


        if (currentTag[tagType + "_alias"] != undefined) {
            let tagAlias = currentTag[tagType + "_alias"].split(',');
            termsToSearch = termsToSearch.concat(tagAlias);
        }
        var found = false;
        for (let j = 0; j < termsToSearch.length && !found; j++) {
            // let rePattern = "/" + termsToSearch[j] + "/i";
            let pat = new RegExp(termsToSearch[j], "i");
            if (pat.test(pathToFile)) {
                found = true;
                let tagObjct = {};
                tagObjct['modelToAddName'] = modelToAddName;
                tagObjct['tagTypeInScene'] = tagTypeInScene;
                tagObjct['tagToAddName'] = tagsArray[i].name;
                arrayOfTagsToAddToScene.push(tagObjct);
                currentPathString = currentPathString.replace(new RegExp(termsToSearch[j], "ig"), "");

            }
        }

    }
    return currentPathString;
}


function addScene(file, sceneFolder) {

    return new Promise(function (resolve, reject) {

        if (file.type == 'Video') {
            models.Scene.filter({path_to_file: file.path}).run().then(function (res) {
                if (res.length == 0) {

                    log.log(5, util.format("Trying to get ffprobe info for file '%s'", file.path), 'colorOther');
                    ffmpeg.getProbeInfo(file.path).then(function (res, ffprobeError) {
                        if (!ffprobeError) {

                            let probeInfo = res;
                            log.log(5, util.format("Got ffprobe info"), 'colorSuccess');


                            let parsedPath = path.parse(file.path);

                            let duration = Math.round(probeInfo.streams[0].duration);
                            let framerate = eval(probeInfo.streams[0].avg_frame_rate);

                            if (isNaN(duration)) {
                                duration = null;
                            }

                            if (isNaN(framerate)) {
                                framerate = null;
                            }

                            let scene = new models.Scene({
                                name: parsedPath.name,
                                path_to_file: file.path,
                                path_to_dir: parsedPath.dir,

                                codec_name: probeInfo.streams[0].codec_long_name,
                                width: probeInfo.streams[0].width,
                                height: probeInfo.streams[0].height,
                                bit_rate: probeInfo.streams[0].bit_rate,
                                duration: duration,
                                size: probeInfo.format.size,
                                framerate: framerate,

                                folder: sceneFolder


                            });


                            scene.saveAll({folder: true}).then(function (savedScene) {
                                log.log(5, util.format("Saved scene: %s with id %s", savedScene.path_to_file, savedScene.id), 'colorOther');


                                ffmpeg.takeScreenshot(savedScene).then(function (res, err) {
                                    if (err) {
                                        log.log(0, util.format("Error while trying to take a screenShot '%s'", err), 'colorError');

                                    }
                                    let sceneWithThumb = res;


                                    parseFilenameForTags(sceneWithThumb, 'Video').then(function (res) {
                                        res.saveAll({}).then(function (res) {
                                            log.log(3, util.format("Finished adding scene: %s", res.path_to_file), 'colorSuccess');
                                            resolve('finished-adding-scene')
                                        })


                                    });


                                }).catch(function (e) {
                                    log.log(0, util.format("Got Error when trying to take screenshot of file '%s' Error: ", file.path_to_file, e), 'colorError');
                                    resolve('finished-adding-scene')
                                });


                            })


                        }


                    }).catch(function (e) {
                        log.log(0, util.format("Got error in ffprobe '%s' skipping file '%s'", e, file.path), 'colorError');
                        resolve('Skipping To Next Scene')
                    })

                } else {
                    log.log(3, util.format("Scene with path '%s' already exists ...", file.path), 'colorWarn');
                    let scene = res[0];


                    ffmpeg.takeScreenshot(scene).then(function (res, err) {
                        if (err) {
                            console.log(err)
                        }
                        log.log(5, util.format("Saved scene with screenshot %s ", res), 'colorOther');


                        resolve('finished-adding-scene')
                    }).catch(function (e) {
                        log.log(0, util.format("Got Error when trying to take screenshot of file '%s' Error: ", file.path_to_file, e), 'colorError');
                        resolve('finished-adding-scene')
                    });


                }
            })
        }

        if (file.type == 'Picture') {
            models.Picture.filter({path_to_file: file.path}).run().then(function (res) {
                if (res.length == 0) {
                    ffmpeg.getProbeInfo(file.path).then(function (probeInfo, ffprobeError) {
                        if (!ffprobeError) {
                            let parsedPath = path.parse(file.path);


                            let picture = new models.Picture({
                                name: parsedPath.name,
                                path_to_file: file.path,
                                path_to_dir: parsedPath.dir,


                                width: probeInfo.streams[0].width,
                                height: probeInfo.streams[0].height,
                                megapixels: (probeInfo.streams[0].width * probeInfo.streams[0].height ) / 1000000,


                                folder: sceneFolder


                            });

                            picture.saveAll().then(function (savedPicture) {

                                parseFilenameForTags(savedPicture, 'Picture').then(function (res) {
                                    res.saveAll({}).then(function (res) {

                                        log.log(3, util.format("Finished adding picture: %s", res.path_to_file), 'colorSuccess');
                                        resolve('finished-adding-scene')
                                    })


                                });

                            })

                        }


                    }).catch(function (e) {
                        log.log(0, util.format("Got error in ffprobe '%s' skipping file '%s'", e, file.path), 'colorError');
                        resolve('Skipping To Next Image')
                    })
                } else {
                    log.log(3, util.format("Image with path '%s' already exists ...", file.path), 'colorWarn');
                    resolve('image-already-exists')
                }

            })

        }


    });


}


function fileAddSimulation(fileArr, folder) {

    return new Promise(function (resolve, reject) {

        function processFileQueue(folder) {
            if (fileArr.length > 0) {
                let file = fileArr.shift();
                addScene(file, folder).then(function (res, err) {

                    processFileQueue(folder);
                });

            } else {
                resolve("Finished adding all files!")
            }
        }

        if (fileArr != undefined && fileArr.length > 0) {

            processFileQueue(folder);

            // eventEmitter.on('finished-adding-scene', processFileQueue);
        }

    });


}

eventEmitter.on('finished-folder-db-access', processFolderQueue);

function addTreeFolderToDb(currentPath, parentPath, level, lastFolderName, files) {

    if (parentPath == "") {

        models.TreeFolder.filter({path_to_folder: currentPath}).run().then(function (res) {
            if (res.length == 0) {
                let treeFolder = new models.TreeFolder({
                    name: currentPath,
                    last_folder_name: lastFolderName,
                    path_to_folder: currentPath,

                    level: level,

                    path_with_ids: null

                });

                if (files != undefined && files.length > 0) {


                    treeFolder.saveAll({sub_folders: true}).then(function (saved) {
                        console.log("model save" + saved);
                        fileAddSimulation(files, currentPath).then(function (res) {
                            console.log(res);
                            eventEmitter.emit('finished-folder-db-access');
                        });


                    })
                } else {
                    treeFolder.saveAll({sub_folders: true}).then(function (saved) {
                        console.log("model save" + saved);
                        eventEmitter.emit('finished-folder-db-access');
                    })

                }


            } else {
                eventEmitter.emit('finished-folder-db-access');
            }

        })

    } else {

        models.TreeFolder.filter({path_to_folder: parentPath}).getJoin({sub_folders: true}).run().then(function (parents) {
            var parent = parents[0];
            var parentPathWithIds = parent.path_with_ids;


            var pathWithId = {
                id: parent.id,
                name: parent.name,
                path_to_folder: parent.path_to_folder,
                last_folder_name: parent.last_folder_name,
                level: parent.level


            };
            var pathWithIds = [];
            if (parent.path_with_ids == null) {

                pathWithIds.push(pathWithId);
            } else {
                var found = false;
                for (let i = 0; i < parentPathWithIds.length && !found; i++) {
                    if (parentPathWithIds[i].id == pathWithId.id) {
                        found = true;
                    }
                }
                if (!found) {
                    pathWithIds = parentPathWithIds;
                    pathWithIds.push(pathWithId);
                } else {
                    pathWithIds = parentPathWithIds;
                }

            }


            models.TreeFolder.filter({path_to_folder: currentPath}).run().then(function (res) {
                if (res.length == 0) {
                    let treeFolder = new models.TreeFolder({
                        name: currentPath,
                        last_folder_name: lastFolderName,
                        path_to_folder: currentPath,

                        level: level,

                        path_with_ids: pathWithIds

                    });

                    parent.sub_folders.push(treeFolder);

                    if (files != undefined && files.length > 0) {

                        parent.saveAll({sub_folders: true}).then(function (saved) {
                            // console.log("saved folder model" + saved);
                            log.log(3, util.format("Added folder '%s' to db", saved.path_to_folder), 'colorSuccess');

                            for (let i = 0; i < saved.sub_folders.length; i++) {
                                if (saved.sub_folders[i].path_to_folder == currentPath) {
                                    fileAddSimulation(files, saved.sub_folders[i]).then(function (res) {
                                        console.log(res);
                                        eventEmitter.emit('finished-folder-db-access');
                                    });
                                }
                            }


                            // eventEmitter.emit('finished-folder-db-access');


                        })

                    } else {
                        parent.saveAll({sub_folders: true}).then(function (saved) {
                            console.log("model save" + saved);

                            eventEmitter.emit('finished-folder-db-access');


                        })
                    }


                } else {
                    log.log(3, util.format("Folder '%s' Already exists in database", currentPath), 'colorWarn');


                    if (files != undefined && files.length > 0) {
                        let fileFolder = res[0];
                        fileAddSimulation(files, fileFolder).then(function (res) {
                            eventEmitter.emit('finished-folder-db-access');
                        });

                    } else {
                        eventEmitter.emit('finished-folder-db-access');
                    }

                }


            })


        });

    }

}

function addTreeFolder(fileAndDir) {

    let dir = fileAndDir.dir;

    let seperatedPath = dir.split(path.sep);


    let pathSoFar = "";
    let level = 0;
    for (let i = 0; i < seperatedPath.length; i++) {

        if (level == 0) {
            let parentPath = pathSoFar;
            pathSoFar = seperatedPath[i];
            let currentPath = pathSoFar;

            let folderToAdd = {
                currentPath: currentPath,
                parentPath: parentPath,
                level: level,
                lastFolderName: seperatedPath[i],
                files: []
            };

            if (folderToAdd.currentPath == dir) {
                folderToAdd.files = fileAndDir.files;
            }

            folderToAddQueue.push(folderToAdd);

            // addTreeFolderToDb(currentPath,parentPath,level,seperatedPath[i],null)

        } else {
            let parentPath = pathSoFar;
            pathSoFar = path.join(pathSoFar, seperatedPath[i]);
            let currentPath = pathSoFar;


            let folderToAdd = {
                currentPath: currentPath,
                parentPath: parentPath,
                level: level,
                lastFolderName: seperatedPath[i],
                files: []
            };

            if (folderToAdd.currentPath == dir) {
                folderToAdd.files = fileAndDir.files;
            }

            folderToAddQueue.push(folderToAdd);

            // addTreeFolderToDb(currentPath,parentPath,level,seperatedPath[i],null)
        }


        level++;

    }


}


function splitToDirsAndFiles(pathToAdd, type) {
    let parsePath = path.parse(pathToAdd);

    var found = false;
    var foundIndex = -1;
    for (let i = 0; i < dirAndFiles.length && !found; i++) {
        if (dirAndFiles[i].dir == parsePath.dir) {
            found = true;
            foundIndex = i;
        }
    }

    if (!found) {
        let dirAndFile = {dir: parsePath.dir, files: []};
        dirAndFile.files.push({path: pathToAdd, type: type});
        dirAndFiles.push(dirAndFile);
    } else {
        dirAndFiles[foundIndex].files.push({path: pathToAdd, type: type});
    }


}


var addFiles = function addFiles(pathToAdd, dirObject) {
    let ext = path.extname(pathToAdd);
    let mediaTypeVideo = dirObject.media_type == 'Video' || dirObject.media_type == 'Both';
    let mediaTypePictures = dirObject.media_type == 'Picture' || dirObject.media_type == 'Both';

    if (mediaTypeVideo && videoExtentions.indexOf(ext) !== -1) {

        splitToDirsAndFiles(pathToAdd, "Video");

    }
    if (mediaTypePictures && pictureExtentions.indexOf(ext) !== -1) {

        splitToDirsAndFiles(pathToAdd, "Picture");

    }
};


var getModelArraySortedByLengthDsc = function (modelName) {
    return new Promise(function (resolve, reject) {
        var r = thinky.r;
        models[modelName].orderBy(r.desc(function (doc) {
                return doc("name").split("").count()
            }
        )).then(function (res, err) {
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

var parseFileNameWrapper = function (dbItem) {

    var pathToFile = dbItem.path_to_file;

    pathToFile = parseFileNameIntoTags(dbItem, websitesArray, "Website", pathToFile);
    pathToFile = parseFileNameIntoTags(dbItem, actorsArray, "Actor", pathToFile);
    pathToFile = parseFileNameIntoTags(dbItem, tagsArray, "Tag", pathToFile);

    return dbItem;


};


var parseFileNameIntoTags = function (dbItem, tagsToAddArray, tagsToAddType, currentPath) {


    let currentPathString = currentPath;
    for (let i = 0; i < tagsToAddArray.length; i++) {
        let currentTag = tagsToAddArray[i];
        let termsToSearch = [];
        var currentTagString = currentTag.name.trim();

        //if there are spaces in the tag
        if (currentTagString.indexOf(' ') != -1) {
            var currentTagSpaces = currentTagString.replace(' ', '. *');
            var currentTagPeriod = currentTagString.replace(' ', '.');

            termsToSearch.push(currentTagPeriod);
            termsToSearch.push(currentTagSpaces);
        } else {
            if (tagsToAddType == "Actor" && currentTag.is_exempt_from_one_word_search == false) {
                log.log(5, util.format("%s - '%s' is only one word and is not exempt from one word search ... skipping ", tagsToAddType, currentTag.name, dbItem.path_to_file), 'color: brown');
                continue;
            }
            termsToSearch.push(currentTagString);
        }


        if (currentTag[tagsToAddType.toLowerCase() + "_alias"] != undefined) {
            let tagAlias = currentTag[tagsToAddType.toLowerCase() + "_alias"].split(',');
            termsToSearch = termsToSearch.concat(tagAlias);
        }
        var found = false;
        for (let j = 0; j < termsToSearch.length && !found; j++) {
            // let rePattern = "/" + termsToSearch[j] + "/i";
            let pat = new RegExp(termsToSearch[j], "i");
            if (pat.test(currentPathString)) {
                found = true;

                if (dbItem[tagsToAddType.toLowerCase() + 's'] == undefined) {
                    dbItem[tagsToAddType.toLowerCase() + 's'] = [];
                }

                let tagFoundInScene = false;
                for (let i = 0; i < dbItem[tagsToAddType.toLowerCase() + 's'].length && !tagFoundInScene; i++) {
                    if (dbItem[tagsToAddType.toLowerCase() + 's'][i].name == currentTag.name) {
                        tagFoundInScene = true;
                    }
                }

                if (!tagFoundInScene) {
                    dbItem[tagsToAddType.toLowerCase() + 's'].push(currentTag);
                    log.log(4, util.format("Added tag of type %s, name %s to item '%s'", tagsToAddType, currentTag.name, dbItem.path_to_file), 'colorWarn');
                } else {
                    log.log(5, util.format("%s - %s already found in scene %s", tagsToAddType, currentTag.name, dbItem.path_to_file), 'color: brown');
                }

                currentPathString = currentPathString.replace(new RegExp(termsToSearch[j], "ig"), "");

            }
        }

    }
    return currentPathString;

};


var walkPath = function walkPath(dirObject) {
        folderToAddQueue = [];
        dirAndFiles = [];


        getAllModelsSortedByNameLengthDsc().then(function () {

                // dir.paths(dirObject.path_to_folder, function (err, paths) {
                //     if (err) throw err;
                //
                //     for (let i = 0; i < paths.files.length; i++) {
                //         addFiles(paths.files[i], dirObject)
                //     }
                //
                //     for (let i = 0; i < dirAndFiles.length; i++) {
                //         addTreeFolder(dirAndFiles[i]);
                //     }
                //     processFolderQueue();
                //
                //
                //     log.log(3, util.format("All Done!"), 'colorSuccess');
                //
                //
                // });


                // var walk = function (dir, done) {
                //     var results = [];
                //     fs.readdir(dir, function (err, list) {
                //         if (err) return done(err);
                //         var i = 0;
                //         (function next() {
                //             var file = list[i++];
                //             if (!file) return done(null, results);
                //             file = path.join(dir, file);
                //             fs.stat(file, function (err, stat) {
                //                 if (stat && stat.isDirectory()) {
                //                     log.log(3, util.format("Entering Dir: '%s' ", file), 'colorOther');
                //                     setTimeout(function () {
                //                         console.log('Would add folder ...');
                //                         walk(file, function (err, res) {
                //                             results = results.concat(res);
                //                             next();
                //                         });
                //                     }, 500);
                //
                //                 } else {
                //                     log.log(3, util.format("File in folder'%s' ", file), 'colorWarn');
                //                     setTimeout(function () {
                //                         console.log('Would add File ...');
                //                         walk(file, function (err, res) {
                //                             results = results.concat(res);
                //                             next();
                //                         });
                //                     }, 10);
                //                     // results.push(file);
                //
                //                 }
                //             });
                //         })();
                //     });
                // };


                var addFolder = function (folderPath, lastFolderName, level, parent) {

                    return new Promise(function (resolve, reject) {

                        models.TreeFolder.filter({path_to_folder: folderPath}).run().then(function (result) {
                            if (result.length == 0) {
                                var parsedPath = path.parse(folderPath);
                                var folderToAdd = new models.TreeFolder({

                                    name: folderPath,
                                    last_folder_name: lastFolderName,
                                    path_to_folder: folderPath,

                                    level: level,

                                    sub_folders: []

                                });

                                folderToAdd.saveAll({sub_folders: true}).then(function (result) {
                                    log.log(4, util.format("Saved folder '%s' to db", result.path_to_folder), 'colorWarn');

                                    if (parent != null) {
                                        if (parent.sub_folders == undefined) {
                                            parent.sub_folders = [];
                                        }
                                        parent.sub_folders.push(result);
                                        parent.saveAll({sub_folders: true}).then(function (parentResult) {
                                            log.log(4, util.format("added folder '%s' to folder's '%s' sub-folders", result.path_to_folder, parentResult.path_to_folder), 'colorWarn');
                                            resolve(result)

                                        })
                                    } else {
                                        resolve(result)
                                    }
                                })
                            } else {
                                log.log(4, util.format("Folder '%s' already exists in db", result[0].path_to_folder), 'colorWarn');
                                resolve(result[0]);
                            }
                        })
                    });
                };

                // make sure that upper folder exists

                var walkCo = co.wrap(function*(dir, parent, level, mediaType) {


                    var dirs = yield fs.readdirAsync(dir);
                    // console.log(dirs);
                    for (let i = 0; i < dirs.length; i++) {
                        var file = path.join(dir, dirs[i]);
                        var stat = yield fs.statAsync(file);
                        if (stat && stat.isFile()) {
                            console.log(file + " is file");
                            let ext = path.extname(file);
                            let mediaTypeVideo = dirObject.media_type == 'Scene' || dirObject.media_type == 'Both';
                            let mediaTypePictures = dirObject.media_type == 'Picture' || dirObject.media_type == 'Both';
                            if (mediaTypeVideo && videoExtentions.indexOf(ext) !== -1) {
                                yield addFile(file, 'Scene', parent)
                            }
                            if (mediaTypePictures && pictureExtentions.indexOf(ext) !== -1) {
                                yield addFile(file, 'Picture', parent)
                            }
                        } else {
                            console.log(file + " is dir");
                            let splitPath = file.split(path.sep);
                            parent = yield addFolder(file, splitPath[splitPath.length - 1], level, parent);
                            yield walkCo(file, parent, level + 1);
                        }
                    }
                    return Promise.resolve();

                });


                co(function*() {

                    var splitPath = dirObject.path_to_folder.split(path.sep);

                    var test = splitPath[0];
                    console.log(test);

                    var parent = yield addFolder(test, test, 0, null);
                    let level = 1;
                    for (let i = 1; i < splitPath.length; i++) {
                        test = path.join(test, splitPath[i]);
                        parent = yield addFolder(test, splitPath[i], level, parent);
                        level++;
                    }

                    yield walkCo(dirObject.path_to_folder, parent, level);

                    log.log(3, util.format("Finished walking folder '%s'", dirObject.path_to_folder), 'colorSuccess')

                });

                var addFile = co.wrap(function*(fileToAddPath, fileToAddType, parent) {

                    var fileInDb = yield models[fileToAddType].filter({path_to_file: fileToAddPath});
                    if (fileInDb.length == 0) {


                        log.log(5, util.format("Trying to get ffprobe info for file '%s'", fileToAddPath), 'colorOther');
                        var probeInfo = null;
                        try {
                            probeInfo = yield ffmpeg.getProbeInfo(fileToAddPath)
                        } catch (e) {
                            log.log(0, util.format("Got error in ffprobe '%s' skipping file '%s'", e, fileToAddPath), 'colorError');
                            Promise.resolve('Skipping To Next Scene');
                            return;
                        }

                        let parsedPath = path.parse(fileToAddPath);

                        let fileToAdd = new models[fileToAddType]({
                            name: parsedPath.name,
                            path_to_file: fileToAddPath,
                            path_to_dir: parsedPath.dir,


                            width: probeInfo.streams[0].width,
                            height: probeInfo.streams[0].height,
                            megapixels: (probeInfo.streams[0].width * probeInfo.streams[0].height ) / 1000000,


                            folder: parent


                        });

                        if (fileToAddType == "Scene") {


                            let duration = Math.round(probeInfo.streams[0].duration);
                            let framerate = eval(probeInfo.streams[0].avg_frame_rate);

                            if (isNaN(duration)) {
                                duration = null;
                            }

                            if (isNaN(framerate)) {
                                framerate = null;
                            }
                            fileToAdd.codec_name = probeInfo.streams[0].codec_long_name;
                            fileToAdd.bit_rate = probeInfo.streams[0].bit_rate;
                            fileToAdd.duration = duration;
                            fileToAdd.size = probeInfo.format.size;
                            fileToAdd.framerate = framerate;

                        }

                        var savedFile = yield fileToAdd.saveAll({folder: true});
                        log.log(5, util.format("Saved %s: %s with id %s", fileToAddType, savedFile.path_to_file, savedFile.id), 'colorOther');

                        if (fileToAddType == "Scene") {
                            try {
                                savedFile = yield ffmpeg.takeScreenshot(savedFile);
                                log.log(4, util.format("Took screenshot of file '%s'", savedFile.path_to_file), 'colorWarn');
                            } catch (error) {
                                log.log(0, util.format("Got Error when trying to take screenshot of file '%s' Error: '%s'", savedFile.path_to_file, error), 'colorError');
                                Promise.resolve('finished-adding-scene');
                                return;

                            }

                        }

                        var taggedFile = parseFileNameWrapper(savedFile);

                        yield taggedFile.saveAll({actors: true, websites: true, tags: true});
                        log.log(4, util.format("Saved tagged file %s", taggedFile.path_to_file), 'colorOther');


                    }

                });


                // async function addFolderAsync(splitPath,parent) {
                //
                //     for (let i = 1; i < splitPath.length; i++) {
                //         var parent = await addFolder(splitPath[i],"last","1",parent);
                //         // test = path.join(test, splitPath[i]);
                //         // console.log(test);
                //
                //     }
                //
                // }


                // addFolder(test,test,0, null).then(function (res) {
                //
                //     addFolderAsync(splitPath,res);
                //
                //     // for (let i = 1; i < splitPath.length; i++) {
                //     //     test = path.join(test, splitPath[i]);
                //     //     console.log(test);
                //     //
                //     // }
                //
                //     walk(dirObject.path_to_folder, function (err, results) {
                //         if (err) throw err;
                //         // console.log(results);
                //         log.log(3, util.format("Finished walking path '%s'", dirObject.path_to_folder), 'colorSuccess');
                //     });
                //
                // });

            }
        )
        ;
    }
    ;


function rescanFilesInFolder(dirObject, folderToCheck) {

    function addItemToArray(array1, array2, itemType) {
        for (let i = 0; i < array2.length; i++) {
            let item = {item: array2[i], item_type: itemType};
            array1.push(item);
        }
        return array1;
    }

    var itemsToCheck = [];
    if (dirObject.media_type == 'Both') {
        itemsToCheck = addItemToArray(itemsToCheck, folderToCheck.scenes, 'Video');
        itemsToCheck = addItemToArray(itemsToCheck, folderToCheck.pictures, 'Picture');
    } else if (dirObject.media_type == 'Video') {
        itemsToCheck = addItemToArray(itemsToCheck, folderToCheck.scenes, 'Video');
    } else {
        itemsToCheck = addItemToArray(itemsToCheck, folderToCheck.pictures, 'Picture');
    }


    // Create a new empty promise
    var sequence = Promise.resolve();

    // Loop over each file, and add on a promise to the
    // end of the 'sequence' promise.
    var counter = 1;
    itemsToCheck.forEach(function (currentItem) {

        // Chain one computation onto the sequence

        sequence = sequence.then(function () {
            var totalItemsToCheck = itemsToCheck.length;
            log.log(4, util.format("Rescanning item %s out of %s in folder '%s'", counter, totalItemsToCheck, dirObject.path_to_folder), 'background: #CBCBCB; color: #000000');
            counter++;
            return parseFilenameForTags(currentItem.item, currentItem.item_type);
        }).then(function (result) {
            log.log(4, util.format("Finished Rescanning scene '%s'", result.path_to_file), 'colorOther');
        });

    });

    // This will resolve after the entire chain is resolved
    return sequence;


    // return new Promise(function (resolve, reject) {
    //
    //
    //
    //
    //     processScenesToCheck();
    //
    //     function processScenesToCheck() {
    //         if (itemsToCheck.length > 0) {
    //             var currentItem = itemsToCheck.shift();
    //             log.log(4, util.format("Rescanning item %s out of %s in folder '%s'", totalItemsToCheck - itemsToCheck.length, totalItemsToCheck, dirObject.path_to_folder), 'background: #CBCBCB; color: #000000');
    //             parseFilenameForTags(currentItem.item, currentItem.item_type).then(function (res) {
    //                 log.log(5, util.format("Finished Rescanning scene '%s'", res.path_to_file), 'colorOther');
    //                 processScenesToCheck()
    //             })
    //         } else {
    //             log.log(5, util.format("Finished tagging files in path '%s'", dirObject.path_to_folder), 'colorOther');
    //             resolve("Finished")
    //         }
    //     }
    //
    // })
}

function rescanSubfolders(folderToCheck, dirObject) {

    // Create a new empty promise
    var sequence = Promise.resolve();

    var subFolders = folderToCheck.sub_folders;

    // Loop over each file, and add on a promise to the
    // end of the 'sequence' promise.
    subFolders.forEach(function (currentSubFolder) {



        // Chain one computation onto the sequence
        sequence = sequence.then(function () {
            var subFolderdirObject = dirObject;
            subFolderdirObject.path_to_folder = currentSubFolder.path_to_folder;
            return rescanFolderForTags(subFolderdirObject);
        }).then(function (result) {
            // doSomething(result) // Resolves for each file, one at a time.
        });

    });

    // This will resolve after the entire chain is resolved
    return sequence;
}


// return new Promise(function (resolve, reject) {
//
//     var subFolders = folderToCheck.sub_folders;
//
//     function rescanSubFoldersAuxFunction() {
//         if (subFolders.length > 0) {
//             var currentSubFolder = subFolders.shift();
//             var subFolderdirObject = dirObject;
//             subFolderdirObject.path_to_folder = currentSubFolder.path_to_folder;
//
//             rescanFolderForTags(subFolderdirObject).then(function (res) {
//                 rescanSubFoldersAuxFunction();
//             })
//
//         } else {
//             resolve();
//         }
//     }
//
//     rescanSubFoldersAuxFunction();
//
// })
// }


var rescanFolderForTags = function (dirObject) {

    return new Promise(function (resolve, reject) {

        co(function*() {

            log.log(4, util.format("Starting rescan of items in folder '%s'", dirObject.path_to_folder), 'colorOther');


            log.log(4, util.format("Loading Actor,Tag and Website models ..."), 'colorWarn');
            yield getAllModelsSortedByNameLengthDsc();
            log.log(4, util.format("Done, Loading Actor,Tag and Website models ..."), 'colorSuccess');

            var pathString = dirObject.path_to_folder;

            function escapeRegExp(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }

            pathString = "(?i)" + escapeRegExp(pathString);

            log.log(4, util.format("Loading items in folder ..."), 'colorWarn');
            var allScenes = yield models.Scene.getJoin({
                actors: true,
                tags: true,
                websites: true
            }).filter(function (test) {
                return test("path_to_dir").match(pathString)
            }).orderBy('path_to_dir');
            log.log(4, util.format("Done ..."), 'colorSuccess');


            log.log(4, util.format("Starting rescan ..."), 'colorWarn');
            for (let i = 0; i < allScenes.length; i++) {
                log.log(4, util.format("Scanning item %s out of %s",i + 1 , allScenes.length), 'colorWarn');
                var itemBeforeParsing = _.cloneDeep(allScenes[i]);
                var parsedItem = parseFileNameWrapper(allScenes[i]);


                if (!_.isEqual(itemBeforeParsing, parsedItem)) {

                    var savedItem = yield parsedItem.saveAll({actors: true, tags: true, websites: true});
                    log.log(4, util.format("Item '%s' was updated", savedItem.path_to_file), 'colorWarn');
                }
            }
            resolve();

        });


        // getAllModelsSortedByNameLengthDsc().then(function () {
        //
        //     models.TreeFolder.getJoin({
        //         sub_folders: true,
        //         scenes: true,
        //         pictures: true
        //     }).filter({path_to_folder: dirObject.path_to_folder}).run().then(function (folderToCheck) {
        //         if (folderToCheck.length == 1) {
        //             folderToCheck = folderToCheck[0];
        //
        //             rescanFilesInFolder(dirObject, folderToCheck).then(function () {
        //
        //
        //                 rescanSubfolders(folderToCheck, dirObject).then(function () {
        //                     resolve();
        //                 });
        //
        //
        //             });
        //
        //
        //         }
        //     });
        //
        // });

    });


};


module.exports.walkPath = walkPath;
module.exports.addScene = addScene;
module.exports.rescanFolderForTags = rescanFolderForTags;

