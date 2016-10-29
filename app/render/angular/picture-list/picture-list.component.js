var models = require(__dirname + '/business/db/models/all.js');

angular.module('pictureList', []).component('pictureList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/picture-list/picture-list.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$mdDialog',
        function SceneListController($scope, $location, $timeout, $rootScope,$mdDialog) {

            var self = this;

            self.searchString = "";
            self.orderBy = "name";

            var dbQueryObject = models.Picture.orderBy({index: self.orderBy}).filter(function (picture) {
                return picture("name").match(self.searchString)
            });



            self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, $scope.$parent.parent_pictures);

            $scope.showDialog = function(ev, clickedItem) {
                $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'render/angular/picture-list/picture-list-dialog.template.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose:true,
                    fullscreen:true,
                    controllerAs: 'dialog',
                    locals:{
                        clickedItem: clickedItem
                    }

                })
                    .then(function(answer) {
                        $scope.status = 'You said the information was "' + answer + '".';
                    }, function() {
                        $scope.status = 'You cancelled the dialog.';
                    });
            };

            function DialogController($scope, $mdDialog, locals) {
                
                var self = this;
                self.item = locals.clickedItem;
                $scope.hide = function() {
                    $mdDialog.hide();
                };

                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }




        }]
});