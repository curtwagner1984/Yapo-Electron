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

            self.up = function () {
                self.folderClick(self.currentUp)

            };


            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "TreeFolder");

            $scope.$on('initiateSearch', function (event, whereQuery) {
                var merged = Object.assign({}, dbQueryObject, whereQuery);

                self.dynamicItems.dbQueryObject = merged;
                self.dynamicItems.reset();

            });


            self.folderClick = function (clickedFolder) {

                self.currentUp = clickedFolder;
                

                    $timeout().then(function () {
                        self.sceneQueryObject = {
                            where: {
                                path_to_dir: clickedFolder.path_to_folder
                            }
                        };

                        self.pictureQueryObject = {
                            where: {
                                path_to_dir: clickedFolder.path_to_folder
                            }
                        };

                        $rootScope.$broadcast('update-list-views');

                    });


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
        