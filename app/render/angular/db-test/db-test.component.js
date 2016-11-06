angular.module('dbTest', []).component('dbTest', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/db-test/db-test.template.html',
    bindings: {},
    controller: ['$scope', '$timeout',
        function DbTestController($scope, $timeout) {


            var self = this;

           

            var vlc = require(__dirname + '/business/util/vlc.js');

            var auxFunc = require(__dirname + '/business/util/auxFunctions.js');

            var tmdbScraper = require(__dirname + '/business/scrapers/tmdbScraper.js');

            var modelsSeq = require(__dirname + '/business/db/sqlite/models/All.js');

            var Sequelize = require(__dirname + '/business/db/sqlite/sequelize.js');
            var _ = require('lodash');


            var co = require('co');
            
            var util = require('util');

            co(function*() {
                // yield modelsSeq.Actor.sync({force: true});
                // yield modelsSeq.ActorAlias.sync({force: true});
                // yield modelsSeq.Picture.sync({force: true});
                // yield modelsSeq.Scene.sync({force: true});
                // yield modelsSeq.Tag.sync({force: true});
                // yield modelsSeq.TagAlias.sync({force: true});
                // yield modelsSeq.Website.sync({force: true});
                // yield modelsSeq.WebsiteAlias.sync({force: true});

                yield modelsSeq.Actor.sync();
                yield modelsSeq.ActorAlias.sync();
                yield modelsSeq.Picture.sync();
                yield modelsSeq.Scene.sync();
                yield modelsSeq.Tag.sync();
                yield modelsSeq.TagAlias.sync();
                yield modelsSeq.Website.sync();
                yield modelsSeq.WebsiteAlias.sync();
                yield modelsSeq.MediaFolder.sync();
                yield modelsSeq.TreeFolder.sync();
                Sequelize.sequelize.sync();



            });
            
            var queryDb = function(searchString){
                console.clear();

                modelsSeq.Actor.findAll({
                    attributes: ['id', 'name'],
                    where:{
                        name: {
                            $like: '%'+searchString+'%'
                        }
                    },
                    order: 'name',
                    limit: 10
                }).then(function (res) {

                    for (let i = 0; i < res.length; i++) {
                        console.log(res[i].name);
                    }


                });
                
            };
         
            self.textBoxInput = "";
            self.taggerQueryRes= [];
            
            self.textboxChange = function () {
                queryDb(self.textBoxInput);
                
            };


            function taggerStringParser (){
                var string = self.textBoxInput;
                var stringArray = string.split(',');

                var first = true;
                var ans = "";
                for (let i = 0 ; i < stringArray.length ; i ++){
                    let term = stringArray[i];
                    term = term.trim();
                    term = term.replace(/ /g,'%');
                    term = '%' + term + '%';
                    if (first){
                        ans = ans + util.format("U.name like '%s'",term);
                        first = false;
                    }else{
                        ans = ans +' or ' + util.format("U.name like '%s'",term)
                    }
                }
                return ans;


            }

            self.taggerTest = function() {

                var queryString = taggerStringParser();
                var rawQuery = util.format("select * from (select t.id, t.name,'Tag' as TableName, (select count(*) from Scene_tag st where st.Tag_id = t.id) as NumberOfScenes, (select count(*) from Picture_tag pt where pt.Tag_id = t.id) as NumberOfPicture, (select count(*) from Actor_tag ac where ac.Tag_id = t.id) as NumberOfActors from Tags t union select w.id, w.name,'Website' as TableName, (select count(*) from Scene_website sw where sw.Website_id = w.id) as NumberOfScenes, (select count(*) from Picture_website pw where pw.Website_id = w.id) as NumberOfPicture, ('0') as NumberOfActors from Websites w union select a.id, a.name, 'Actor' as TableName, (select count(*) from Scene_actor sa where sa.Actor_id = a.id) as NumberOfScenes, (select count(*) from Picture_actor pa where pa.Actor_id = a.id) as NumberOfPicture, ('0') as NumberOfActor from Actors a ) as U where %s order by NumberOfScenes DESC, NumberOfPicture DESC limit 10",queryString);
                // JS has issue with strings and line breaks ... this is how this query looks like 


                // select * from
                // (select t.id, t.name,
                //     (select count(*) from Scene_tag st where st.Tag_id = t.id) as NumberOfScenes,
                //     (select count(*) from Picture_tag pt where pt.Tag_id = t.id) as NumberOfPicture,
                //     (select count(*) from Actor_tag ac where ac.Tag_id = t.id) as NumberOfActors
                // from Tags t
                // union
                // select w.id, w.name,
                //     (select count(*) from Scene_website sw where sw.Website_id = w.id) as NumberOfScenes,
                //     (select count(*) from Picture_website pw where pw.Website_id = w.id) as NumberOfPicture,
                // ('0') as NumberOfActors
                // from Websites w
                // union
                // select a.id, a.name,
                //     (select count(*) from Scene_actor sa where sa.Actor_id = a.id) as NumberOfScenes,
                //     (select count(*) from Picture_actor pa where pa.Actor_id = a.id) as NumberOfPicture,
                // ('0') as NumberOfActor
                // from Actors a
                // ) as U
                // where U.name like '%legs%'
                // order by NumberOfScenes DESC, NumberOfPicture DESC

                console.log(rawQuery);
                
                 Sequelize.sequelize.query(rawQuery).then(function (y) {
                    console.log(y);
                     $timeout().then(function () {
                         self.taggerQueryRes = y[0];
                         console.log(self.taggerQueryRes);


                         var string = self.textBoxInput;
                         var stringArray = string.split(',');

                         var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
                         
                         for (let i = 0 ; i < stringArray.length ; i++){
                             let pat = new RegExp(stringArray[i].trim().replace(/ /g, '.*?'), "i");

                             let matches = _.filter(self.taggerQueryRes, function (o) {
                                 return pat.test(o.name)
                             });
                             
                             if (matches.length == 1){
                                 matches[0].matched = "Matched to " + stringArray[i];
                                 self.textBoxInput = self.textBoxInput.replace(stringArray[i],'');
                             }

                             for (let j = 0 ; j < matches.length ; j ++){
                                 matches[j].background = CSS_COLOR_NAMES[i];
                             }





                         }




                     });
                    
                    
                });





            };


            // modelsSeq.Actor.sync({force: true}).then(function () {
            //    return modelsSeq.Actor.create({
            //        name: 'Isis Love',
            //        gender: 'Female',
            //        country_of_origin: 'USA'
            //    })
            // });


            // var User = sequelize.define('user', {
            //     firstName: {
            //         type: Sequelize.STRING,
            //         field: 'first_name' // Will result in an attribute that is firstName when user facing but first_name in the database
            //     },
            //     lastName: {
            //         type: Sequelize.STRING
            //     }
            // }, {
            //     freezeTableName: true // Model tableName will be the same as the model name
            // });
            //
            // User.sync({force: true}).then(function () {
            //     // Table created
            //     return User.create({
            //         firstName: 'John',
            //         lastName: 'Hancock'
            //     });
            // });



            self.playVlc = function (scene) {
                vlc.playVlc(scene);
            };

            self.tmdbOutput = "";
            self.actorToSearch = "";

            // self.actors = models.Scene.getJoin({actors: true});
            //
            // self.actors = self.actors.filter(function (actor) {
            //     return actor('actors').contains(function (ac){
            //         return ac("name").match("(?i)isis")
            //     })
            // });
            //
            // self.actors = self.actors.filter(function (actor) {
            //     return actor('actors').contains(function (ac){
            //         return ac("name").match("(?i)kurt")
            //     })
            // });


            // self.actors.run().then(function (res) {
            //    console.log("actors loaded " + res)
            // });


            self.scrape = function () {
                self.currentActor = self.actors.shift();
                self.tmdbOutput = tmdbScraper.findActorInfo(self.currentActor).then(function (res) {
                    self.tmdbOutput = angular.toJson(res);
                    console.log(self.tmdbOutput);
                });

            };


            self.getRelatedFields = function () {

                //Users.get(someuserid).getJoin({posts:true}).getField('posts')

                models.Actor.get("990ad3fb-a8f1-449e-a72e-7dc8c50ad9c3").getJoin({
                    scenes: {
                        actors: true,
                        tags: true,
                        websites: true,
                        _apply: function (sequence) {
                            return sequence.filter(function (scene) {
                                return scene("path_to_file").match("SAS")
                            }).orderBy("path_to_file")
                        }
                    }
                }).getField('scenes').execute().then(function (res) {
                    console.log(res);
                });

                // Post.getAll(User.get(1).getField('id'), { index: 'author_id' })


                var query = models.Actor.get("990ad3fb-a8f1-449e-a72e-7dc8c50ad9c3").getJoin({
                    scenes: {
                        actors: true,
                        tags: true,
                        websites: true,
                        _apply: function (sequence) {
                            return sequence.filter(function (scene) {
                                return scene("path_to_file").match("SAS")
                            }).orderBy("path_to_file")


                        }
                    }
                });

                query.run().then(function (res) {
                    console.log(res)
                });

                var dbQueryObject = models.Actor.orderBy({index: "name"}).filter(function (actor) {
                    return actor("name").match("(?i)isis")
                });

                var dbQueryGetJoinObject = {
                    actors: true,
                    tags: true,
                    websites: true,
                    scenes: {
                        _apply: function (seq) {
                            return seq.count()
                        },
                        _array: false
                    },
                    pictures: {
                        _apply: function (seq) {
                            return seq.count()
                        },
                        _array: false
                    }
                };

                dbQueryObject.slice(0, 100).getJoin(dbQueryGetJoinObject).execute().then(function (res) {
                    console.log(res)
                });


                // models.Actor.get("990ad3fb-a8f1-449e-a72e-7dc8c50ad9c3").getJoin({scenes: true}).run().then(function (res) {
                //     console.log(res);
                // })

            };

            self.multiIndex = function () {
                var scene;
                var actor;
                models.Scene.get("001793ab-4535-40a5-83d1-7fe406ec6c7f").run().then(function (res) {
                    console.log(res);
                    scene = res;

                    models.Actor.filter({name: 'Christy Mack'}).run().then(function (res) {
                        console.log(res[0]);
                        actor = res[0];

                        var actorNameId = {name: actor.name, id: actor.id};
                        if (scene.actors == undefined) {
                            scene.actors = [];
                        }

                        var found = false;
                        for (let i = 0; i < scene.actors.length && !found; i++) {
                            if (_.isEqual(scene.actors[i], actorNameId)) {
                                found = true;
                            }
                        }

                        if (!found) {
                            scene.actors.push(actorNameId);
                        }


                        scene.save().then(function (res) {
                            console.log(res);
                        })


                    })
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