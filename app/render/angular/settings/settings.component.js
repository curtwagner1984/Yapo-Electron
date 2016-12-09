angular.module('settings', []).component('settings', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/settings/settings.template.html',
    bindings: {},
    controller: ['$scope', '$timeout', 'hotkeys',
        function SettingsController($scope, $timeout, hotkeys) {


            const modelsSeq = require(__dirname + '/business/db/sqlite/models/All.js');
            const ipc = require('electron').ipcRenderer;
            const fileImport = require(__dirname + '/business/files/file-import');
            const log = require(__dirname + '/business/util/log.js');
            const util = require('util');
            const shell = require('electron').shell;
            const tmdbScraper = require(__dirname + '/business/scrapers/tmdbScraper.js');
            const co = require('co');
            const _ = require('lodash');
            var childProcess = require("child_process");

            var self = this;

            // Hotkey test
            hotkeys.bindTo($scope)
                .add({
                    combo: 'w',
                    description: 'My hotkey',
                    callback: function () {
                        alert("You pressed W!");
                    }
                });

            self.dirs = [];

            self.currentDir = "";
            self.foldersInDb = [];


            self.thingsToAddTextArea = "";
            self.thingsToAddType = "";
            self.thingsToAddTypeOptions = ["Actor", "Tag", "Website"];
            self.thingsToAddIsMainstream = false;


            var scanActorsTMdB = co.wrap(function*(arrayOfActors) {

                for (let i = 0; i < arrayOfActors.length; i++) {
                    if (arrayOfActors[i].date_last_lookup == undefined) {
                        yield tmdbScraper.findActorInfo(arrayOfActors[i])
                    } else {
                        log.log(4, util.format("Actor '%s' was already scraped in %s", arrayOfActors[i].name, arrayOfActors[i].date_last_lookup))
                    }

                }

            });

            self.scanAllActors = function () {

                // models.Actor.orderBy({index: "name"}).then(function (actorArray){
                //     scanActorsTMdB(actorArray);
                // });

                modelsSeq.Actor.findAll({
                    date_last_lookup: null,
                    order: 'name'
                }).then(function (res) {

                    scanActorsTMdB(res)

                });


            };

            var csv2ObjectArray = function () {
                if (self.thingsToAddTextArea != "" && self.thingsToAddType != "") {
                    var ans = [];

                    let thingsArr = self.thingsToAddTextArea.split(',');


                    for (let i = 0; i < thingsArr.length; i++) {
                        var objToAdd = {
                            name: thingsArr[i].trim().replace(/[&\/\\#,+()$~%:*?<>]/g, ''),
                            type: self.thingsToAddType,
                            isMainstream: self.thingsToAddIsMainstream
                        };

                        ans.push(objToAdd);
                    }

                    return ans;

                }


            };

            var addThings = co.wrap(function*() {

                var arrayOfThingsToAdd = csv2ObjectArray();

                if (arrayOfThingsToAdd) {
                    for (let i = 0; i < arrayOfThingsToAdd.length; i++) {
                        let thingToAdd = arrayOfThingsToAdd[i];

                        var temp = {
                            name: thingToAdd.name
                        };

                        if (self.thingsToAddIsMainstream) {
                            temp['is_mainstream'] = true;
                        }

                        try {

                            var result = yield modelsSeq[thingToAdd.type].findOrCreate({
                                where: temp,
                                defaults: temp // set the default properties if it doesn't exist
                            });

                            var author = result[0], // the instance of the author
                                created = result[1]; // boolean stating if it was created or not

                            if (created) {
                                console.log("%cCreated '%c%s'%c - '%c%s'", 'color: black', 'color: blue', thingToAdd.type, 'color:black', 'color: green', thingToAdd.name);
                            } else {
                                console.log('%s - %s already exists', thingToAdd.type, thingToAdd.name);
                            }

                        } catch (e) {
                            console.error("Something bad happended when trying to insert actor %s ERROR:", temp.name, e)
                        }


                    }
                }
            });

            self.addMultipleValues = function () {

                addThings();


                // models[thingToAdd.type].filter({name: thingToAdd.name}).run().then(function (res) {
                //     if (res.length == 0) {
                //         let thingToAddModel = null;
                //         if (thingToAdd.type == 'Actor') {
                //             thingToAddModel = new models[thingToAdd.type]({
                //                 name: thingToAdd.name,
                //                 is_mainstream: thingToAdd.isMainstream
                //
                //             })
                //         } else {
                //             thingToAddModel = new models[thingToAdd.type]({
                //                 name: thingToAdd.name
                //             })
                //         }
                //
                //         thingToAddModel.save().then(function (res) {
                //             log.log(3, util.format("Added %s - '%s' to database.", thingToAdd.type, thingToAdd.name), 'colorSuccess')
                //         })
                //
                //     }else{
                //         log.log(5, util.format("%s - '%s' already exists in database.", thingToAdd.type, thingToAdd.name), 'colorWarn')
                //     }
                // })
            };


            // Sends event to main process in order to open a 'Open File' dialog box
            self.addDir = function () {
                ipc.send('add-dir')
            };

            // Response from main process. This event is emitted when a file is selected in the 'Open File' dialog box.
            ipc.on('got-dir', function (event, path) {

                // $timeout is used instead of $scope.$apply(); to apply the changes in the next $digest loop. 
                $timeout(function () {
                    // anything you want can go here and will safely be run on the next digest.
                    let dirObject = {path: path, isVideo: true, isPicture: false};
                    self.dirs.push(dirObject);
                    self.currentDir = dirObject.path
                });

            });

            function makeTempDirObject(dirObject) {
                var tempDirObject = {};
                tempDirObject['name'] = dirObject.name;
                tempDirObject['path_to_dir'] = dirObject.path_to_dir;
                tempDirObject['is_video'] = dirObject.is_video;
                tempDirObject['is_picture'] = dirObject.is_picture;
                return tempDirObject;
            }


            // Walks the selected dir.
            self.getPaths = function (dirObject) {

                return new Promise(function (resolve, reject) {

                    log.log(3, util.format("Starting Folder Walk ... "), 'colorOther');

                    var tempDirObject = makeTempDirObject(dirObject);
                    var child = childProcess.fork(__dirname + '/business/files/file-import', [], {silent: true});

                    var tempObject = {};
                    tempObject['message'] = "walkPath";
                    tempObject['dirObject'] = tempDirObject;

                    var tempObjectJson = JSON.stringify(tempObject);

                    child.on('message', (m) => {
                        console.log('PARENT got message:' + m);
                        if (m.toString() == 'job finished') {
                            console.log("%cJob Finished!", 'color: blue');
                            resolve();
                        }
                    });

                    child.stdout.on('data', function (data) {
                        console.log('stdout:' + data);
                    });
                    child.stderr.on('data', function (data) {
                        console.log('stderror' + data);
                    });

                    child.send(tempObjectJson);

                });


            };

            // Rescan Path for tags.
            self.rescanPath = function (dirObject) {

                return new Promise(function (resolve, reject) {

                    var tempDirObject = makeTempDirObject(dirObject);

                    var child = childProcess.fork(__dirname + '/business/files/file-import', [], {silent: true});

                    var tempObject = {};
                    tempObject['message'] = "rescanPath";
                    tempObject['dirObject'] = tempDirObject;

                    var tempObjectJson = JSON.stringify(tempObject);

                    child.on('message', (m) => {
                        console.log('PARENT got message:' + m);
                        if (m.toString() == 'job finished') {
                            console.log("%cJob Finished!", 'color: blue');
                            resolve();
                        }
                    });

                    child.stdout.on('data', function (data) {
                        console.log('stdout:' + data);
                    });
                    child.stderr.on('data', function (data) {
                        console.log('stderror' + data);
                    });

                    child.send(tempObjectJson);


                })


            };

            self.walkSelectedPaths = co.wrap(function*() {
                var toScan = _.filter(self.foldersInDb, function (o) {
                    return o.to_scan == true;
                });

                for (let i = 0; i < toScan.length; i++) {
                    yield self.getPaths(toScan[i]);
                }


            });

            self.scanSelectedPaths = co.wrap(function*() {
                var toScan = _.filter(self.foldersInDb, function (o) {
                    return o.to_scan == true;
                });

                for (let i = 0; i < toScan.length; i++) {
                    yield self.rescanPath(toScan[i]);
                }


            });

            //queries the database for all Media Folders.
            var loadFoldersFromDb = function () {
                self.foldersInDb = [];
                modelsSeq.MediaFolder.findAll({
                    order: 'path_to_dir'
                }).then(function (folders) {
                    $timeout(function () {
                        // anything you want can go here and will safely be run on the next digest.
                        self.foldersInDb = folders;
                    });

                });


            };

            loadFoldersFromDb();


            self.addFolderToDb = function (dirObject) {


                var x = modelsSeq.MediaFolder.findOrCreate({
                    where: {
                        name: dirObject.path,
                        path_to_dir: dirObject.path,

                        is_picture: dirObject.isPicture,
                        is_video: dirObject.isVideo

                    }

                }).then(function (res) {
                    if (res[1]) {
                        console.log(res[0]);
                        $timeout(function () {
                            self.foldersInDb.push(res[0]);
                            self.dirs = _.filter(self.dirs, function (o) {
                                return o.path != res[0].path_to_dir;
                            });
                        });

                    } else {
                        console.log("Dir " + dirObject + "Already exists!")
                    }
                })

            };

            self.deleteMediaFolderFromDb = function (folder) {
                modelsSeq.MediaFolder.destroy({
                    id: folder.id
                }).then(function (res) {
                    console.log("The folder " + folder.path_to_folder + "Was deleted from the database!");
                    _.remove(self.foldersInDb, {
                        id: folder.id
                    })
                });

            };


            self.openFolderInExploer = function (folderPath) {
                shell.showItemInFolder(folderPath);
            };





        }
    ]
});