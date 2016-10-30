var models = require(__dirname + '/business/db/models/all.js');

angular.module('tagList', []).component('tagList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/tag-list/tag-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function TagListController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            self.searchString = "";
            self.orderBy = "name";

            var dbQueryObject = models.Tag.orderBy({index: self.orderBy}).filter(function (tag) {
                return tag("name").match(self.searchString)
            });


            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, $scope.$parent.parent_scenes);

            $scope.$on('initiateSearch', function (event, dbQueryObject) {
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });

        }]
});