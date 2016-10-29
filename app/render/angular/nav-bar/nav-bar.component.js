var models = require(__dirname + '/business/db/models/all.js');
var fileOp = require(__dirname + '/business/files/file-operations.js');
var auxFunc = require(__dirname + '/business/util/auxFunctions.js');
var log = require(__dirname + '/business/util/log.js');

angular.module('navBar', []).component('navBar', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/nav-bar/nav-bar.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$rootScope', '$timeout',
        function NavBarController($scope, $location, $rootScope, $timeout) {


            var self = this;

            self.test = "This is a test.";
            self.currentLocation = $location.path();

            // In this example, we set up our model using a class.
            // Using a plain object works too. All that matters
            // is that we implement getItemAtIndex and getLength.
            $rootScope.DynamicItems = function (dbQueryObject, itemsArray) {


                /**
                 * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
                 */
                this.loadedPages = {};

                /** @type {number} Total number of items. */
                this.numItems = 0;

                /** @const {number} Number of items to fetch per request. */
                this.PAGE_SIZE = 100;

                this.dbQueryObject = dbQueryObject;
                // this.searchString = searchString;
                if (itemsArray == undefined || itemsArray == null) {
                    this.fetchNumItems_();
                }else{
                    this.itemsArray = itemsArray.then(angular.bind(this, function (res) {
                        this.arrayIsInput(res);

                        



                    }));
                }


            };

            $rootScope.DynamicItems.prototype.arrayIsInput = function (array) {
                $timeout().then(angular.bind(this, function () {
                    this.numItems = array.length;

                    for (let i = 0 ; i < array.length ; i++){
                        var pageNumber = Math.floor(i / this.PAGE_SIZE);
                        if (!this.loadedPages[pageNumber]){
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

                if (this.itemsArray == undefined || this.itemsArray == null) {


                    this.dbQueryObject.slice(pageOffset, pageOffset + this.PAGE_SIZE).getJoin({
                        actors: true,
                        tags: true,
                        websites: true,
                        scenes: true
                    }).run().then(angular.bind(this, function (scenes) {
                        $timeout().then(angular.bind(this, function () {
                            this.loadedPages[pageNumber] = scenes;
                        }));


                    }));
                }
                // }else{
                //     this.loadedPages[pageNumber] = [];
                //     for (var i = pageOffset; i < pageOffset + this.PAGE_SIZE; i++) {
                //         this.loadedPages[pageNumber].push(this.itemsArray.);
                //     }
                //
                // }


            };

            $rootScope.DynamicItems.prototype.fetchNumItems_ = function () {

                if (this.itemsArray == undefined || this.itemsArray == null) {

                    // var searchString = "(?i)" + this.searchString;
                    // var searchField = this.searchField;


                    // models[this.itemType].filter(function (scene) {
                    //     return scene(searchField).match(searchString)
                    // })

                    this.dbQueryObject.count().execute().then(angular.bind(this, function (count, err) {


                        $timeout().then(angular.bind(this, function () {
                            this.numItems = count;

                        }));

                    }));

                }

                // else{
                //     this.numItems = this.itemsArray.length;
                // }


            };

            $rootScope.tagAutoComplete = function (searchType, searchString) {
                return new Promise(function (resolve, reject) {
                    var searchStringIgnoreCase = "(?i)" + searchString;


                    models[searchType].orderBy({index: "name"}).filter(function (doc) {
                        return doc("name").match(searchStringIgnoreCase)
                    }).limit(10).run().then(function (res) {
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

            $rootScope.tagChipTransform = function (scene, tagType, tagTypeInScene, tagToAddName, mediaType) {

                if (tagToAddName != "") {

                    if (angular.isObject(tagToAddName)) {
                        tagToAddName = tagToAddName.name;
                    }

                    auxFunc.addTagToScene(scene, tagType, tagTypeInScene, tagToAddName, mediaType).then(function (res) {
                        $timeout(function () {
                            scene = res;
                        });
                    });

                }

                return null;

            };

            $rootScope.tagChipRemove = function (scene, $chip) {
                scene.saveAll().then(function (res) {
                    log.log(4, util.format("Removed '%s' from '%s'", $chip.name, res.name))
                });


            };
        }
    ]
});