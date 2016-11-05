
angular.module('actorDetail', []).component('actorDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/actor-detail/actor-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function ActorDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            var actorId = $routeParams.actorId;
            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            var dbQueryObject =  {
                include: [
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ],
                where:{
                    id: actorId
                }


            };

            self.sceneQueryObject = {
                include: [
                    {model: models.Actor, as: 'actors', where:{id: actorId}},
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ]
                

            };

            self.pictureQueryObject = {
                include: [
                    {model: models.Actor, as: 'actors', where:{id: actorId}},
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ]


            };
            


            self.actor = models.Actor.findOne(dbQueryObject).then(function (res) {
                $timeout().then(function () {
                    self.actor = res;
                })

            });


        }]
});
