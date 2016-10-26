angular.module('dbTest', []).component('dbTest', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/db-test/db-test.template.html',
    bindings: {},
    controller: ['$scope', '$timeout',
        function DbTestController($scope, $timeout) {


            var self = this;

            self.test = "This is a test.";


            var models = require(__dirname + '/business/db/models/all.js');

            var thinky = require(__dirname + '/business/db/util/thinky.js');

            var vlc = require(__dirname + '/business/util/vlc.js');

            var auxFunc = require(__dirname + '/business/util/auxFunctions.js');

            var tmdbScraper = require(__dirname + '/business/scrapers/tmdbScraper.js');

            self.playVlc = function (scene) {
                vlc.playVlc(scene);
            };

            self.tmdbOutput = "";
            self.actorToSearch = "";

            self.actors = models.Actor.then(function (res) {
                console.log("Actors loaded");
                self.actors = res;


            });


            self.scrape = function () {
                self.currentActor = self.actors.shift();
                 self.tmdbOutput = tmdbScraper.findActorInfo(self.currentActor).then(function (res) {
                  self.tmdbOutput = angular.toJson(res);
                  console.log(self.tmdbOutput);
              });

            };

            // var query = thinky.Query

            // self.actor = new models.Actor({
            //     name: "Angelina Jolie",
            //     rating: 8,
            //     thumbnail: 'http://img.wennermedia.com/article-leads-vertical-300/1351182578_angelina-jolie-290.jpg'
            // });
            //
            //
            // self.saveActor = function () {
            //     self.actor.save("Actor").then(function (result) {
            //         console.log(result);
            //     }).error(function (error) {
            //         console.log(error);
            //     });
            // };
            //
            // self.editActor = function (actor) {
            //     self.actor = actor;
            //
            // };
            //
            // self.all_actors = {};
            //
            // self.actorTag = "";
            //
            // self.saveActorTag = function (name) {
            //
            //     models.ActorTag.filter({name: name}).run().then(function (res) {
            //
            //         let tag;
            //         if (res.length > 0) {
            //             tag = res[0];
            //         } else {
            //             tag = new models.ActorTag({
            //                 name: name
            //             });
            //         }
            //
            //         if (self.actor.actor_tags == undefined) {
            //             self.actor.actor_tags = [];
            //         }
            //
            //         self.actor.actor_tags.push(tag);
            //
            //
            //         self.actor.saveAll({actor_tags: true}).then(function (res) {
            //             console.log(res)
            //         })
            //
            //     });
            //
            //
            // };
            //
            // self.currentTag = undefined;
            //
            //
            //
            // self.setCurrentTag = function (id) {
            //
            //     models.ActorTag.get(id).getJoin({actors: true}).run().then(function (tag) {
            //
            //         $timeout(function () {
            //             self.currentTag = tag;
            //         });
            //
            //
            //     })
            //
            //
            // };
            //
            //
            // models.Actor.getJoin({actor_tags: true}).run().then(function (actors) {
            //
            //
            //     $timeout(function () {
            //         // anything you want can go here and will safely be run on the next digest.
            //         self.all_actors = actors;
            //
            //         for (let i = 0; i < self.all_actors.length; i++) {
            //             console.log(self.all_actors[i].name);
            //
            //             for (let j = 0; j < self.all_actors[i].actor_tags.length; j++) {
            //                 console.log("   " + self.all_actors[i].actor_tags[j].name)
            //             }
            //         }
            //     });
            //
            //
            // }).error(console.log);
            //
            // self.dbFolders = null;
            //
            // models.TreeFolder.getJoin({sub_folders: true, scenes: true}).orderBy('name').run().then(function (folders) {
            //     $timeout(function () {
            //         self.dbFolders = folders;
            //     });
            //
            // });
            //
            // self.scenes = null;
            // self.pictures = [];
            //
            // models.Scene.getJoin().orderBy('name').limit(10).run().then(function (scenes) {
            //     $timeout(function () {
            //         self.scenes = scenes;
            //     });
            //
            // });
            //
            // models.Picture.getJoin({actors: true}).orderBy('path_to_folder').limit(10).run().then(function (pictures) {
            //     $timeout(function () {
            //         self.pictures = pictures;
            //     });
            //
            // });
            //
            // self.actorTagName = "";
            // self.sceneTagName = "";
            // self.foldersName = "";
            // self.websiteName = "";
            // self.actorName = "";
            //
            //
            // self.addTagToScene = function (scene, tagType, tagTypeInScene, tagToAddName) {
            //     if (tagToAddName != "") {
            //
            //         auxFunc.addTagToScene(scene, tagType, tagTypeInScene, tagToAddName).then(function (res) {
            //             $timeout(function () {
            //                 scene = res;
            //             });
            //         });
            //
            //     }
            //
            // };
            //
            // self.searchParameters = ["name", "path_to_file", "path_to_dir", "codec_name", "actor_name"];
            // self.selectedSearchParameter = "";
            // self.searchTypeOptions = ["Scene", "Picture"];
            // self.selectedSearchType = "";
            // self.searchString = "";
            //
            // self.tiles = [];
            //
            // self.generateTiles = function () {
            //     var tiles = [];
            //
            //     for (let i = 0; i < self.pictures.length; i++) {
            //         var tile = {};
            //         if (self.pictures[i].height > self.pictures[i].width) {
            //             tile.rowspan = 2;
            //             tile.colspan = 1;
            //
            //         } else {
            //             tile.rowspan = 2;
            //             tile.colspan = 1;
            //
            //         }
            //         tile.img = self.pictures[i].path_to_file;
            //         tiles.push(tile)
            //     }
            //     return tiles;
            // };
            //
            //
            // self.search = function () {
            //
            //     if (self.searchString != "") {
            //         var searchString = "(?i)" + self.searchString;
            //         if (self.searchString != "actor_name") {
            //             models[self.selectedSearchType].getJoin().filter(function (scene) {
            //                 return scene(self.selectedSearchParameter).match(searchString)
            //             }).limit(50).run().then(function (res) {
            //                 $timeout(function () {
            //                     if (self.selectedSearchType == "Scene") {
            //                         self.scenes = [];
            //                         self.pictures = [];
            //                         self.scenes = res;
            //                     } else {
            //                         self.pictures = [];
            //                         self.scenes = [];
            //                         self.pictures = res;
            //                         self.tiles =self.generateTiles();
            //                     }
            //
            //                 })
            //             })
            //         } else {
            //             models[self.selectedSearchType].getJoin().filter(function (scene) {
            //                 return scene("actors").contains(function (actor) {
            //                     return actor("name").match(searchString)
            //                 });
            //
            //             }).run().then(function (res) {
            //                 $timeout(function () {
            //                     self.scenes = res
            //                 })
            //             })
            //
            //         }
            //
            //
            //     }
            //
            //
            // };
            

            

        }
    ]
});