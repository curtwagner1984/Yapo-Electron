var models = require(__dirname + '/business/db/models/all.js');

var thinky = require(__dirname + '/business/db/util/thinky.js');

var vlc = require(__dirname + '/business/util/vlc.js');

var auxFunc = require(__dirname + '/business/util/auxFunctions.js');



    angular.module('sceneList', []).component('sceneList', {
        // Note: The URL is relative to our `index.html` file
        templateUrl: 'render/angular/scene-list/scene-list.template.html',
        bindings: {},
        controller: ['$scope', '$location', '$timeout',
            function SceneListController($scope, $location, $timeout) {


                var self = this;

                self.orderBy = "name";
                self.searchString = "";




                // In this example, we set up our model using a class.
                // Using a plain object works too. All that matters
                // is that we implement getItemAtIndex and getLength.
                var DynamicItems = function () {


                    /**
                     * @type {!Object<?Array>} Data pages, keyed by page number (0-index).
                     */
                    this.loadedPages = {};

                    /** @type {number} Total number of items. */
                    this.numItems = 0;

                    /** @const {number} Number of items to fetch per request. */
                    this.PAGE_SIZE = 50;

                    this.fetchNumItems_();
                };

                // Required.
                DynamicItems.prototype.getItemAtIndex = function (index) {
                    var pageNumber = Math.floor(index / this.PAGE_SIZE);
                    var page = this.loadedPages[pageNumber];

                    if (page) {
                        return page[index % this.PAGE_SIZE];
                    } else if (page !== null) {
                        this.fetchPage_(pageNumber);
                    }
                };

                // Required.
                DynamicItems.prototype.getLength = function () {
                    return this.numItems;
                };

                DynamicItems.prototype.reset = function () {
                    this.loadedPages = {};
                    this.numItems = 0;
                    this.fetchNumItems_();
                };

                DynamicItems.prototype.fetchPage_ = function (pageNumber) {
                    // Set the page to null so we know it is already being fetched.
                    this.loadedPages[pageNumber] = null;

                    // For demo purposes, we simulate loading more items with a timed
                    // promise. In real code, this function would likely contain an
                    // $http request.

                    this.loadedPages[pageNumber] = [];
                    var pageOffset = pageNumber * this.PAGE_SIZE;
                    var searchString = "(?i)" + self.searchString;

                    models.Scene.getJoin({
                        actors: true,
                        scene_tags: true,
                        websites: true
                    }).orderBy(self.orderBy).filter(function (scene) {
                        return scene(self.orderBy).match(searchString)
                    }).slice(pageOffset, pageOffset + this.PAGE_SIZE).run().then(angular.bind(this, function (scenes) {

                        $timeout().then(angular.bind(this, function() {
                            for (let i = 0; i < scenes.length; i++) {
                                this.loadedPages[pageNumber].push(scenes[i]);

                            }
                        }));


                    }));


                    // $timeout(angular.noop, 300).then(angular.bind(this, function() {
                    //     this.loadedPages[pageNumber] = [];
                    //     var pageOffset = pageNumber * this.PAGE_SIZE;
                    //     for (var i = pageOffset; i < pageOffset + this.PAGE_SIZE; i++) {
                    //         this.loadedPages[pageNumber].push(i);
                    //     }
                    // }));
                };

                DynamicItems.prototype.fetchNumItems_ = function () {
                    // For demo purposes, we simulate loading the item count with a timed
                    // promise. In real code, this function would likely contain an
                    // $http request.

                    // $timeout(angular.noop, 300).then(angular.bind(this, function () {
                    //     this.numItems = 50000;
                    // }));

                    var searchString = "(?i)" + self.searchString;

                    models.Scene.filter(function (scene) {
                        return scene(self.orderBy).match(searchString)
                    }).count().execute().then(angular.bind(this, function (count, err) {
                        $timeout().then(angular.bind(this, function() {
                            this.numItems = count;

                        }));

                    }));

                };

                self.dynamicItems = new DynamicItems();



                self.search = function () {
                    self.dynamicItems.reset();

                };



                self.querySearch = function (searchType, searchString) {
                    return new Promise(function (resolve, reject) {
                        var searchStringIgnoreCase = "(?i)" + searchString;


                        models[searchType].filter(function (doc) {
                            return doc("name").match(searchStringIgnoreCase)
                        }).limit(10).run().then(function (res) {
                            console.log(res);
                            resolve(res);
                        });

                    });


                };

                self.playVlc = function (scene) {
                    vlc.playVlc(scene);
                };



                self.chipTransform = function (scene, tagType, tagTypeInScene, tagToAddName) {

                    if (tagToAddName != "") {

                        if (angular.isObject(tagToAddName)) {
                            tagToAddName = tagToAddName.name;
                        }

                        auxFunc.addTagToScene(scene, tagType, tagTypeInScene, tagToAddName).then(function (res) {
                            $timeout(function () {
                                scene = res;
                            });
                        });

                    }

                    return null;

                };




            }
        ]
    });