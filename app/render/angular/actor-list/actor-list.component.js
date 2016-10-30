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



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, $scope.$parent.parent_scenes);

            $scope.$on('initiateSearch', function (event, dbQueryObject) {
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });
            
            


        }]
});
        