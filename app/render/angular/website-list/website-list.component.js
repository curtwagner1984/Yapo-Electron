var models = require(__dirname + '/business/db/models/all.js');

angular.module('websiteList', []).component('websiteList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/website-list/website-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function WebsiteController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            self.searchString = "";
            self.orderBy = 'name';

            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            var dbQueryObject =  {

            };



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "Website");

            $scope.$on('initiateSearch', function (event, whereQuery) {
                dbQueryObject['where'] = whereQuery;
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });

        }]
});