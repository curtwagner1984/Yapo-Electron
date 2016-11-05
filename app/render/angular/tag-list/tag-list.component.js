
angular.module('tagList', []).component('tagList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/tag-list/tag-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function TagListController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            var dbQueryObject =  {

            };



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "Tag");

            $scope.$on('initiateSearch', function (event, whereQuery) {
                var merged = Object.assign({}, dbQueryObject, whereQuery);

                self.dynamicItems.dbQueryObject = merged;
                self.dynamicItems.reset();

            });

        }]
});