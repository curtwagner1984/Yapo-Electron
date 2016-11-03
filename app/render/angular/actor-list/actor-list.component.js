var models = require(__dirname + '/business/db/models/all.js');

angular.module('actorList', []).component('actorList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-list/actor-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope',
        function SceneListController($scope, $location, $timeout, $rootScope) {
            
            var self = this;
            
            self.searchString = "";
            self.orderBy = "name";

            var dbQueryObject = models.Actor.orderBy({index: self.orderBy}).filter(function (actor) {
                return actor("name").match(self.searchString)
            });

            var dbQueryGetJoinObject = {
                actors: true,
                tags: true,
                websites: true,
                scenes: {
                    _apply: function(seq) { return seq.count() },
                    _array: false
                },
                pictures:{
                    _apply: function(seq) { return seq.count() },
                    _array: false
                }
            };



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, dbQueryGetJoinObject);

            $scope.$on('initiateSearch', function (event, dbQueryObject) {
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });
            
            


        }]
});
        