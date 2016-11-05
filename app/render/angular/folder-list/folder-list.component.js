angular.module('folderList', []).component('folderList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/folder-list/folder-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope',
        function FolderListController($scope, $location, $timeout, $rootScope) {

            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');


            self.searchString = "";

            var dbQueryObject = {
                include: [
                    {model: models.TreeFolder, as: 'parent'},
                    {model: models.TreeFolder, as: 'subFolders'}

                ],
                where: {
                    level: 0
                }


            };


            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "TreeFolder");

            $scope.$on('initiateSearch', function (event, whereQuery) {
                dbQueryObject['where'] = whereQuery;
                self.dynamicItems.dbQueryObject = dbQueryObject;
                self.dynamicItems.reset();

            });


            self.folderClick = function (clickedFolder) {

                var newQuery = {
                    include: [
                        {model: models.TreeFolder, as: 'parent', where: {id: clickedFolder.id}},
                        {model: models.TreeFolder, as: 'subFolders'}

                    ]


                };

                self.dynamicItems.dbQueryObject = newQuery;
                self.dynamicItems.reset();
            }


        }]
});
        