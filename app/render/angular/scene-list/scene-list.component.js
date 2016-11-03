var auxFunc = require(__dirname + '/business/util/auxFunctions.js');

var models = require(__dirname + '/business/db/models/all.js');

var thinky = require(__dirname + '/business/db/util/thinky.js');

var vlc = require(__dirname + '/business/util/vlc.js');

var dynamicItems = require(__dirname + '/render/angular/common/DynamicItems.js');


var log = require(__dirname + '/business/util/log.js');
var util = require('util');

angular.module('sceneList', []).component('sceneList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/scene-list/scene-list.template.html',
    bindings: {
        dbQueryObject: '<',
        dbQueryGetJoinObject: '<',
        getField: '<'
    },
    controller: ['$scope', '$location', '$timeout', '$rootScope',
        function SceneListController($scope, $location, $timeout, $rootScope) {


            var self = this;

            self.orderBy = "name";
            self.searchString = "";


            if (self.dbQueryObject != undefined) {
                self.dynamicItems = new $rootScope.DynamicItems(self.dbQueryObject, self.dbQueryGetJoinObject, self.getField);
            } else {
                var dbQueryObject = models.Scene.orderBy({index: self.orderBy}).filter(function (scene) {
                    return scene("path_to_file").match(self.searchString)
                });

                var dbQueryGetJoinObject = {
                    actors: true,
                    tags: true,
                    websites: true
                };


                self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, dbQueryGetJoinObject);
            }


            $scope.$on('initiateSearch', function (event, dbQueryObject) {
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });


            self.search = function () {
                self.dynamicItems.searchString = self.searchString;
                self.dynamicItems.reset();


            };


            self.playVlc = function (scene) {
                vlc.playVlc(scene);
            };


            self.getSceneLength = function (lengthInSeconds) {
                if (lengthInSeconds != undefined) {
                    return auxFunc.timeSecondsToHHMMSS(lengthInSeconds)
                } else {
                    return "NaN";
                }

            }


        }
    ]
});