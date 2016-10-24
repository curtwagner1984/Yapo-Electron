angular.module('settings', []).component('settings', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/settings/settings.template.html',
    bindings: {},
    controller: ['$scope', '$timeout',
        function SettingsController($scope, $timeout) {

            const models = require(__dirname + '/business/db/models/all.js');
            const thinky = require(__dirname + '/business/db/util/thinky.js');
            const ipc = require('electron').ipcRenderer;
            const fileImport = require(__dirname + '/business/files/file-import');
            const log = require(__dirname + '/business/util/log.js');
            const util = require('util');
            const shell = require('electron').shell;


            var self = this;

            self.dirs = [];

            self.currentDir = "";
            self.foldersInDb = [];


            self.thingsToAddTextArea = "";
            self.thingsToAddType = "";
            self.thingsToAddTypeOptions = ["Actor", "Tag", "Website"];
            self.thingsToAddIsMainstream = false;

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


            self.addMultipleValues = function () {

                var arrayOfThingsToAdd = csv2ObjectArray();

                if (arrayOfThingsToAdd) {
                    for (let i = 0; i < arrayOfThingsToAdd.length; i++) {
                        let thingToAdd = arrayOfThingsToAdd[i];
                        models[thingToAdd.type].filter({name: thingToAdd.name}).run().then(function (res) {
                            if (res.length == 0) {
                                let thingToAddModel = null;
                                if (thingToAdd.type == 'Actor') {
                                    thingToAddModel = new models[thingToAdd.type]({
                                        name: thingToAdd.name,
                                        is_mainstream: thingToAdd.isMainstream

                                    })
                                } else {
                                    thingToAddModel = new models[thingToAdd.type]({
                                        name: thingToAdd.name
                                    })
                                }

                                thingToAddModel.save().then(function (res) {
                                    log.log(3, util.format("Added %s - '%s' to database.", thingToAdd.type, thingToAdd.name), 'colorSuccess')
                                })

                            }else{
                                log.log(5, util.format("%s - '%s' already exists in database.", thingToAdd.type, thingToAdd.name), 'colorWarn')
                            }
                        })
                    }

                }


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

            // Walks the selected dir.
            self.getPaths = function (dirObject) {
                fileImport.walkPath(dirObject)
            };

            // Rescan Path for tags.
            self.rescanPath = function (dirObject) {
                var tempDirObject = dirObject;
                fileImport.rescanFolderForTags(dirObject).then(function () {
                    log.log(4, util.format("Finished Scanning Path '%s'",tempDirObject.path_to_folder), 'colorSuccess');
                });

            };

            //queries the database for all Media Folders.
            var loadFoldersFromDb = function () {
                models.MediaFolder.orderBy("path_to_folder").run().then(function (folders) {
                    $timeout(function () {
                        // anything you want can go here and will safely be run on the next digest.
                        self.foldersInDb = folders;
                    });


                }).error(console.log);
            };

            loadFoldersFromDb();

            var stringify = function (doc) {
                return JSON.stringify(doc, null, 2);
            };

            // Database feed that monitors changes to the MediaFolder table.
            models.MediaFolder.changes().then(function (feed) {
                feed.each(function (error, doc) {
                    if (error) {
                        console.log(error);
                        process.exit(1);
                    }

                    if (doc.isSaved() === false) {
                        console.log("The following document was deleted:");
                        console.log(stringify(doc));
                        loadFoldersFromDb();
                    }
                    else if (doc.getOldValue() == null) {
                        console.log("A new document was inserted:");
                        console.log(stringify(doc));
                        loadFoldersFromDb();
                    }
                    else {
                        console.log("A document was updated.");
                        console.log("Old value:");
                        console.log(stringify(doc.getOldValue()));
                        console.log("New value:");
                        console.log(stringify(doc));
                        loadFoldersFromDb();
                    }
                });
            }).error(function (error) {
                console.log(error);
                process.exit(1);
            });


            self.addFolderToDb = function (dirObject) {

                models.MediaFolder.filter({path_to_folder: dirObject.path}).run().then(function (res) {


                    if (res.length > 0) {
                        console.log("Dir " + dirObject + "Already exists!")
                    } else {

                        let media_type = "";

                        if (dirObject.isVideo && dirObject.isPicture) {
                            media_type = 'Both'
                        } else if (dirObject.isVideo) {
                            media_type = 'Scene'
                        } else if (dirObject.isPicture) {
                            media_type = 'Picture'
                        } else {
                            console.error("Content Type for folder " + res.name + "was not defined!");
                        }


                        let mediaFolder = new models.MediaFolder({
                            name: dirObject.path,
                            path_to_folder: dirObject.path,
                            media_type: media_type
                        });

                        mediaFolder.save().then(function (res) {
                            console.log(res)
                        })

                    }


                });

            };

            self.deleteMediaFolderFromDb = function (idOfFolderToDelete) {
                models.MediaFolder.get(idOfFolderToDelete).then(function (folder) {
                    let temp = folder;
                    folder.delete().then(function (res) {
                        console.log(res);
                        console.log("The folder " + temp.path_to_folder + "Was deleted from the database!")
                    })
                })
            };

            self.testFile = "";

            self.addTestScene = function () {
                fileImport.addScene(self.testFile);
            };

            self.openFolderInExploer = function (folderPath) {
                shell.showItemInFolder(folderPath);
            }


        }
    ]
});