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

            var dbQueryObject = models.Website.orderBy({index: self.orderBy}).filter(function (website) {
                return website("name").match(self.searchString)
            });

            var dbQueryGetJoinObject = {
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