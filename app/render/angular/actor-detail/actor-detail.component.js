var models = require(__dirname + '/business/db/models/all.js');
angular.module('actorDetail', []).component('actorDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-detail/actor-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function ActorDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var actorId = $routeParams.actorId;
            var nestedOrderBy = "path_to_file";

            $scope.parent_scenes = new Promise(function (resolveScenes, reject) {

                    $scope.parent_pictures = new Promise(function (resolvePictures, reject) {

                        self.actor = models.Actor.get(actorId).getJoin({
                            scenes: {
                                actors: true,
                                tags: true,
                                websites: true,
                                _apply: function (sequence) {
                                    return sequence.orderBy(nestedOrderBy)
                                }
                            },
                            pictures: {
                                actors: true,
                                tags: true,
                                websites: true,
                                _apply: function (sequence) {
                                    return sequence.orderBy(nestedOrderBy)
                                }
                            },
                            websites: true
                        }).run().then(function (res) {

                            $timeout(function () {
                                self.actor = res;
                                resolveScenes(res.scenes);
                                resolvePictures(res.pictures)
                            })

                        })

                    })
                }
            )
            ;
            
            
            
            
            
            

        }]
});
