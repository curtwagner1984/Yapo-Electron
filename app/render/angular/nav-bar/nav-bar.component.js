var fileOp = require(__dirname + '/business/files/file-operations.js');
var auxFunc = require(__dirname + '/business/util/auxFunctions.js');
var log = require(__dirname + '/business/util/log.js');
var util = require('util');
var _ = require('lodash');

angular.module('navBar', []).component('navBar', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/nav-bar/nav-bar.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$rootScope', '$timeout','hotkeys','$window',
        function NavBarController($scope, $location, $rootScope, $timeout, hotkeys, $window) {


            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');


            self.showSearch = false;


            self.searchOptions = [];
            self.selectedSearchOption = "";
            self.searchString = "";

            self.searchOrderOptions = [];
            self.selectedSearchOrder = "";
            self.searchOrderAscDsc = false;

            self.isPageSearchable = false;

            hotkeys.bindTo($scope)
                .add({
                    combo: 'ctrl+f',
                    description: 'Search if Search toggle is available',
                    callback: function() {
                        if (self.isPageSearchable){

                            self.showSearch = !self.showSearch;

                            $timeout().then(function () {
                                var element = $window.document.getElementById("search-input");
                                element.focus()
                            })

                        }

                    }
                });


            var populateSearchOptions = function (currentUrl) {
                switch (currentUrl) {
                    case "/scene":
                        self.searchOptions = ["name", "path_to_file", "codec_name", "rating", "play_count", "width", "height", "bit_rate", "duration", "size", "framerate", "createdAt"];
                        self.searchOrderOptions = ["name", "path_to_file", "codec_name", "rating", "play_count", "width", "height", "bit_rate", "duration", "size", "framerate", "createdAt"];
                        self.isPageSearchable = true;
                        break;
                    case "/picture":
                        self.searchOptions = ["name", "path_to_file", "rating", "play_count", "width", "height", "createdAt"];
                        self.searchOrderOptions = ["name", "path_to_file", "rating", "play_count", "width", "height", "createdAt" ,"megapixel"];
                        self.isPageSearchable = true;
                        break;
                    case "/actor":
                        self.searchOptions = ["name", "weight", "height", "country_of_origin", "rating", "play_count", "createdAt"];
                        self.searchOrderOptions = ["name", "weight", "height", "country_of_origin", "rating", "play_count", "createdAt"];
                        self.isPageSearchable = true;
                        break;
                    case "/tag":
                        self.searchOptions = ["name", "rating", "createdAt"];
                        self.searchOrderOptions = ["name", "rating", "createdAt"];
                        self.isPageSearchable = true;
                        break;
                    case "/website":
                        self.searchOptions = ["name", "rating", "createdAt"];
                        self.searchOrderOptions = ["name", "rating", "createdAt"];
                        self.isPageSearchable = true;
                        break;
                    default:
                        self.isPageSearchable = false;

                }


            };

            populateSearchOptions($location.url());
            $rootScope.$on("$routeChangeSuccess", function () {
                populateSearchOptions($location.url());
                console.log("route is now '%s'", $location.url());
            });

            var generatedbQueryObject = function () {


                var ans = {};
                var orderDirection = 'ASC';

                if (self.searchOrderAscDsc){
                    orderDirection = 'DESC';
                }

                ans = {
                    where: {
                        [self.selectedSearchOption]: {
                            $like: '%' + self.searchString + '%'
                        }
                    },
                    order:[
                        [self.selectedSearchOrder, orderDirection]
                    ]

                };


                return ans;


            };

            self.initiateSearch = function () {

                var dbQueryObject = generatedbQueryObject();

                $rootScope.$broadcast('initiateSearch', dbQueryObject)

            };


            self.test = "This is a test.";
            self.currentLocation = $location.path();

            // In this example, we set up our model using a class.
            // Using a plain object works too. All that matters
            // is that we implement getItemAtIndex and getLength.
            $rootScope.DynamicItems = function (dbQueryObject, modelName) {


                /**
                 * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
                 */
                this.loadedPages = {};

                /** @type {number} Total number of items. */
                this.numItems = 0;

                /** @const {number} Number of items to fetch per request. */
                this.PAGE_SIZE = 100;

                this.dbQueryObject = dbQueryObject;

                // this.dbQueryGetJoinObject = dbQueryGetJoinObject;

                // this.getField = getField;

                this.modelName = modelName;

                this.fetchNumItems_();


                // this.searchString = searchString;
                // if (itemsArray == undefined || itemsArray == null) {
                //     this.fetchNumItems_();
                // }else{
                //     this.itemsArray = itemsArray.then(angular.bind(this, function (res) {
                //         this.arrayIsInput(res);
                //     }));
                // }


            };

            $rootScope.DynamicItems.prototype.arrayIsInput = function (array) {
                $timeout().then(angular.bind(this, function () {
                    this.numItems = array.length;

                    for (let i = 0; i < array.length; i++) {
                        var pageNumber = Math.floor(i / this.PAGE_SIZE);
                        if (!this.loadedPages[pageNumber]) {
                            this.loadedPages[pageNumber] = [];
                        }
                        this.loadedPages[pageNumber].push(array[i]);
                    }
                }));
            };

// Required.
            $rootScope.DynamicItems.prototype.getItemAtIndex = function (index) {
                var pageNumber = Math.floor(index / this.PAGE_SIZE);
                var page = this.loadedPages[pageNumber];

                if (page) {
                    return page[index % this.PAGE_SIZE];
                } else if (page !== null) {
                    this.fetchPage_(pageNumber);
                }
            };

// Required.
            $rootScope.DynamicItems.prototype.getLength = function () {
                return this.numItems;
            };

            $rootScope.DynamicItems.prototype.reset = function () {
                this.loadedPages = {};
                this.numItems = 0;
                this.fetchNumItems_();
            };

            $rootScope.DynamicItems.prototype.fetchPage_ = function (pageNumber) {
                // Set the page to null so we know it is already being fetched.
                this.loadedPages[pageNumber] = null;
                var pageOffset = pageNumber * this.PAGE_SIZE;

                var tempDbQueryObject = this.dbQueryObject;


                tempDbQueryObject.offset = pageOffset;
                tempDbQueryObject.limit = this.PAGE_SIZE;
                tempDbQueryObject.subQuery = false;


                models[this.modelName].findAll(tempDbQueryObject).then(angular.bind(this, function (scenes) {
                    $timeout().then(angular.bind(this, function () {
                        this.loadedPages[pageNumber] = scenes;
                    }))
                }));


                // if (this.itemsArray == undefined || this.itemsArray == null) {
                //
                //
                //     // this.dbQueryObject.slice(pageOffset, pageOffset + this.PAGE_SIZE).getJoin({
                //     //     actors: true,
                //     //     tags: true,
                //     //     websites: true,
                //     //     scenes: true,
                //     //     pictures: true
                //     // }).run().then(angular.bind(this, function (scenes) {
                //     //     $timeout().then(angular.bind(this, function () {
                //     //         this.loadedPages[pageNumber] = scenes;
                //     //     }));
                //     // }));
                //
                //     var query = this.dbQueryObject;
                //     // .slice(pageOffset, pageOffset + this.PAGE_SIZE).getJoin(this.dbQueryGetJoinObject);
                //
                //     if (this.getField) {
                //         query = query.getJoin(this.dbQueryGetJoinObject).getField(this.getField).slice(pageOffset, pageOffset + this.PAGE_SIZE)
                //     } else {
                //         query = query.slice(pageOffset, pageOffset + this.PAGE_SIZE).getJoin(this.dbQueryGetJoinObject);
                //     }
                //     query.execute().then(angular.bind(this, function (scenes) {
                //         $timeout().then(angular.bind(this, function () {
                //             this.loadedPages[pageNumber] = scenes;
                //         }));
                //     }));
                // }
            };

            $rootScope.DynamicItems.prototype.fetchNumItems_ = function () {


                models[this.modelName].count(this.dbQueryObject).then(angular.bind(this, function (count, err) {
                    $timeout().then(angular.bind(this, function () {
                        this.numItems = count;
                    }))
                }));

                // if (this.itemsArray == undefined || this.itemsArray == null) {
                //     let query = this.dbQueryObject;
                //     if (this.getField){
                //
                //         query = query.getJoin(this.dbQueryGetJoinObject).getField(this.getField);
                //     }
                //     query.count().execute().then(angular.bind(this, function (count, err) {
                //         $timeout().then(angular.bind(this, function () {
                //             this.numItems = count;
                //         }));
                //     }));
                // }
            };

            $rootScope.tagAutoComplete = function (searchType, searchString) {
                return new Promise(function (resolve, reject) {


                    models[searchType].findAll({
                        where: {
                            name: {
                                $like: '%' + searchString + '%'
                            }
                        },
                        order: 'name',
                        limit: 10
                    }).then(function (res) {

                        $timeout(function () {
                            resolve(res);
                        });


                    });


                });
            };

            $rootScope.getSmallImagePath = function (imagePath, pxSize, modelType) {
                var ans = "";
                if (imagePath != undefined) {
                    ans = fileOp.getSmallPath(imagePath, pxSize);
                } else {
                    if (modelType == 'Actor') {
                        ans = fileOp.getSmallPath(auxFunc.constants.noActorImagePath, pxSize)
                    } else {
                        ans = fileOp.getSmallPath(auxFunc.constants.noSceneImagePath, pxSize)
                    }

                }

                return ans;

            };

            $rootScope.tagChipTransform = function (scene, tagType, tagTypeInScene, tagToAddName, modelType) {


                if (tagToAddName != "") {


                    var command = 'add' + tagType;

                    if (angular.isObject(tagToAddName)) {

                        if (!_.some(scene[tagType.toLowerCase() + 's'], ['id', tagToAddName.id])) {

                            scene[command](tagToAddName).then(function () {

                                scene.reload({
                                    include: [
                                        {model: models.Actor, as: 'actors'},
                                        {model: models.Tag, as: 'tags'},
                                        {model: models.Website, as: 'websites'}

                                    ]
                                }).then(function (updatedScene) {
                                    $timeout(function () {
                                        scene = updatedScene;
                                        console.log("%cAdded %c'%s'%c - %c'%s'%c to '%s'", 'color: black', 'color: blue', tagType, 'color: black', 'color:green', tagToAddName.name, 'color:black', scene.name)
                                    });

                                })


                            })

                        } else {
                            console.log("Tag already exists in scene");
                        }


                    } else {

                        models[tagType].create({
                            name: tagToAddName
                        }).then(function (res) {
                            scene[command](res).then(function () {

                                scene.reload({
                                    include: [
                                        {model: models.Actor, as: 'actors'},
                                        {model: models.Tag, as: 'tags'},
                                        {model: models.Website, as: 'websites'}

                                    ]
                                }).then(function (updatedScene) {
                                    $timeout(function () {
                                        scene = updatedScene;
                                        console.log("%cAdded %c'%s'%c - %c'%s'%c to '%s'", 'color: black', 'color: blue', tagType, 'color: black', 'color:green', tagToAddName, 'color:black', scene.name)
                                    });
                                });

                            })
                        })


                    }

                    return null;

                }
            };

            $rootScope.tagChipRemove = function (scene, $chip) {

                var command = 'remove' + $chip.$modelOptions.name.singular;

                scene[command]($chip).then(function () {

                    scene.reload({
                        include: [
                            {model: models.Actor, as: 'actors'},
                            {model: models.Tag, as: 'tags'},
                            {model: models.Website, as: 'websites'}

                        ]
                    }).then(function (updatedScene) {
                        $timeout(function () {
                            scene = updatedScene;
                            console.log("%cRemoved %c'%s'%c - %c'%s'%c from '%s'", 'color: black', 'color: blue', $chip.$modelOptions.name.singular, 'color: black', 'color:green', $chip.name, 'color:black', scene.name)
                        });

                    })


                });


            };

            $rootScope.deleteItemFromDb = function (itemToDelete) {

                var itemModel = itemToDelete.getModel();
                models[itemModel].get(itemToDelete.id).getJoin().then(function (item) {
                    let temp = item;
                    item.delete().then(function (res) {
                        log.log(3, util.format("%s named '%s' was deleted from the database", itemModel, temp.name), 'colorError');

                    })
                })

            }
        }
    ]
});