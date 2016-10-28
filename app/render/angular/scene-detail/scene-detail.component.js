var models = require(__dirname + '/business/db/models/all.js');
angular.module('sceneDetail', []).component('sceneDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/scene-detail/scene-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function SceneDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var sceneId = $routeParams.sceneId;
            
            self.scene = models.Scene.get(sceneId).getJoin({actors: true, tags: true, websites: true}).run().then(function (res) {

                $timeout(function () {
                    self.scene = res;
                })

                
                
            })
            
            
            
            

        }]
});
