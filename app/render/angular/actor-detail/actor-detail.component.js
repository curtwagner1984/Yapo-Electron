var models = require(__dirname + '/business/db/models/all.js');
angular.module('actorDetail', []).component('actorDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-detail/actor-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function ActorDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            var actorId = $routeParams.actorId;
            var nestedOrderBy = "path_to_file";

            self.dbQueryObject = models.Actor.get(actorId);

            self.dbQueryGetJoinObjectScenes = {
                scenes: {
                    actors: true,
                    tags: true,
                    websites: true,
                    _apply: function (sequence) {
                        return sequence.filter(function (scene) {
                            return scene("path_to_file").match("")
                        }).orderBy("path_to_file")
                    }
                }
            };

            self.dbQueryGetJoinObjectPictures = {
                pictures: {
                    actors: true,
                    tags: true,
                    websites: true,
                    _apply: function (sequence) {
                        return sequence.filter(function (scene) {
                            return scene("path_to_file").match("")
                        }).orderBy("path_to_file")
                    }
                }
            };

            self.getFieldScenes = 'scenes';
            self.getFieldPictures = 'pictures';

            self.actor = models.Actor.get(actorId).getJoin({
                tags: true,
                websites: true
            }).run().then(function (res) {
                self.actor = res;
            });


        }]
});
