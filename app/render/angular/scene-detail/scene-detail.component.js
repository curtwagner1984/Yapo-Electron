
angular.module('sceneDetail', []).component('sceneDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/scene-detail/scene-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function SceneDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var sceneId = $routeParams.sceneId;

            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            var dbQueryObject =  {
                include: [
                    {model: models.Actor, as: 'actors'},
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ],
                where:{
                    id: sceneId
                }


            };

            self.scene = models.Scene.findOne(dbQueryObject).then(function (res) {
                $timeout().then(function () {
                    self.scene = res;
                })

            });



            // self.dynamicItems = new $rootScope.DynamicItems(dbQueryObject, "Scene");
            

            
            
            
            

        }]
});
