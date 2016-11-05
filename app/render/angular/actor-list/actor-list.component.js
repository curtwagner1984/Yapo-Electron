
angular.module('actorList', []).component('actorList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-list/actor-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope',
        function SceneListController($scope, $location, $timeout, $rootScope) {
            
            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            self.searchString = "";
            self.orderBy = "name";

            // var dbQueryObject = models.Actor.orderBy({index: self.orderBy}).filter(function (actor) {
            //     return actor("name").match(self.searchString)
            // });

            var dbQueryObject =  {
                include: [
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ]


            };



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "Actor");

            $scope.$on('initiateSearch', function (event, whereQuery) {
                dbQueryObject['where'] = whereQuery;
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });
            
            


        }]
});
        