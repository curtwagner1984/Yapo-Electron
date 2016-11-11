

angular.module('pictureList', []).component('pictureList', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/picture-list/picture-list.template.html',
    bindings: {
        dbQueryObject: '=',
        dbQueryGetJoinObject: '=',
        getField: '='
    },
    controller: ['$scope', '$location', '$timeout', '$rootScope','$mdDialog','$window',
        function SceneListController($scope, $location, $timeout, $rootScope,$mdDialog, $window) {

            var self = this;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');


            self.searchString = "";
            self.orderBy = "name";
            self.fullView = false;
            
            self.windowWidth = $window.innerWidth;
            self.windowHeight = $window.innerHeight;

            angular.element($window).bind('resize', function () {
                console.log('Window width: ' + $window.innerWidth);
                console.log('Window height: ' + $window.innerHeight);
                self.windowWidth = $window.innerWidth;
                self.windowHeight = $window.innerHeight
            });




            var dbQueryObject =  {
                include: [
                    {model: models.Actor, as: 'actors'},
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ]


            };


            if (self.dbQueryObject == undefined){
                self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "Picture");
            }else{
                self.dynamicItems = new $rootScope.DynamicItems(self.dbQueryObject, "Picture");
            }




            $scope.$on('initiateSearch', function (event, whereQuery) {
                var merged = Object.assign({}, dbQueryObject, whereQuery);

                self.dynamicItems.dbQueryObject = merged;
                self.dynamicItems.reset();

            });

            $scope.$on('update-list-views', function (event) {
                if (self.dbQueryObject != undefined){

                    var merged = Object.assign({}, {}, $scope.$parent.$ctrl.sceneQueryObject);

                    self.dynamicItems.dbQueryObject = merged;
                    self.dynamicItems.reset();
                }



            });

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
