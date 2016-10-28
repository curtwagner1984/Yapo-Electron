var models = require(__dirname + '/business/db/models/all.js');
angular.module('actorDetail', []).component('actorDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-detail/actor-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function ActorDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var actorId = $routeParams.actorId;

            $scope.parent_scenes = new Promise(function (resolve, reject) {

                    self.actor = models.Actor.get(actorId).getJoin({scenes: {actors: true, tags: true, websites: true}, tags: true, websites: true}).run().then(function (res) {

                        $timeout(function () {
                            self.actor = res;
                            resolve(res.scenes)
                        })

                    })
                    
                })
            ;
            
            
            
            
            
            

        }]
});
