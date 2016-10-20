const dir = require('node-dir');
const path = require('path');

const models = require('../db/models/all.js');
const thinky = require('../db/util/thinky.js');
const ffmpeg = require('../ffmpeg/ffmpeg.js');
const auxFunc = require('../util/auxFunctions.js');
const log = require('../util/log.js');
const util = require('util');

const events = require('events');
var eventEmitter = new events.EventEmitter();

var videoExtentions = [".mp4", ".avi", ".mov", ".flv", ".rm", ".wmv", ".mov", ".m4v", ".mpg", ".mpeg", ".mkv", ".divx"];
var pictureExtentions = [".jpg", ".gif", ".png", ".bmp", ".jpeg", ".webm"];

var lastFilePath = "";

var folderToAddQueue = [];
var dirAndFiles = [];


var actorTagsArray = [];
var actorAliasArray = [];
var sceneTagsArray = [];
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
                auxFunc.addTagToScene(itemToAdd, currentTag.modelToAddName, currentTag.tagTypeInScene, currentTag.tagToAddName).then(function (res) {
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
                                            log.log(3, util.format("Finished adding scene: %s", res.name), 'colorSuccess');
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

                                        log.log(3, util.format("Finished adding picture: %s", res.name), 'colorSuccess');
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
                            console.log("saved folder model" + saved);

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
        r.table(models[modelName].getTableName()).orderBy(r.desc(function (doc) {
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

                getModelArraySortedByLengthDsc('SceneTag').then(function (sceneTags) {
                    sceneTagsArray = sceneTags;

                    getModelArraySortedByLengthDsc('PictureTag').then(function (pictureTags) {
                        pictureTagsArray = pictureTags;
                        resolve("Loaded all models.")
                    })

                })


            })


        });

    });
};


var walkPath = function walkPath(dirObject) {
    folderToAddQueue = [];
    dirAndFiles = [];

    getAllModelsSortedByNameLengthDsc().then(function () {

        dir.paths(dirObject.path_to_folder, function (err, paths) {
            if (err) throw err;

            for (let i = 0; i < paths.files.length; i++) {
                addFiles(paths.files[i], dirObject)
            }

            for (let i = 0; i < dirAndFiles.length; i++) {
                addTreeFolder(dirAndFiles[i]);
            }
            processFolderQueue();


            log.log(3, util.format("All Done!"), 'colorSuccess');


        });
    });

};

var rescanFolderForTags = function (dirObject) {

    return new Promise(function (resolve, reject) {

        getAllModelsSortedByNameLengthDsc().then(function () {

            models.TreeFolder.getJoin({
                sub_folders: true,
                scenes: true,
                pictures: true
            }).filter({path_to_folder: dirObject.path_to_folder}).run().then(function (folderToCheck) {
                if (folderToCheck.length == 1) {
                    folderToCheck = folderToCheck[0];

                    if (folderToCheck.sub_folders.length != 0) {
                        var subFolders = folderToCheck.sub_folders;

                        function rescanSubFolders() {
                            if (subFolders.length > 0) {
                                var currentSubFolder = subFolders.shift();
                                var subFolderdirObject = dirObject;
                                subFolderdirObject.path_to_folder = currentSubFolder.path_to_folder;

                                rescanFolderForTags(subFolderdirObject).then(function (res) {
                                    rescanSubFolders();
                                })

                            }
                        }

                        rescanSubFolders();


                    }

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


                    processScenesToCheck();

                    function processScenesToCheck() {
                        if (itemsToCheck.length > 0) {
                            var currentItem = itemsToCheck.shift();
                            parseFilenameForTags(currentItem.item, currentItem.item_type).then(function (res) {
                                log.log(5, util.format("Finished rescaning scene '%s'", res.name), 'colorSuccess');


                                processScenesToCheck()
                            })
                        } else {
                            log.log(5, util.format("Finished tagging files in path '%s'", dirObject.path_to_folder), 'colorOther');
                            resolve("Finished")
                        }
                    }

                    // eventEmitter.on('Finished-rescanning-scene', processScenesToCheck);


                }
            });

        });

    });


};


module.exports.walkPath = walkPath;
module.exports.addScene = addScene;
module.exports.rescanFolderForTags = rescanFolderForTags;

