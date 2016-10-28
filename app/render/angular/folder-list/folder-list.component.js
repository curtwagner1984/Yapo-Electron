var models = require(__dirname + '/business/db/models/all.js');

angular.module('folderList', []).component('folderList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/folder-list/folder-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope',
        function FolderListController($scope, $location, $timeout, $rootScope) {
            
            var self = this;
            
            self.searchString = "";
            
            var dbQueryObject = models.TreeFolder.filter({'level': 0}).orderBy("path_to_folder");

            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, null);
            
            


        }]
});
        