var models = require(__dirname + '/business/db/models/all.js');

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
                dbQueryObject['where'] = whereQuery;
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });

        }]
});