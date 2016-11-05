
angular.module('tagDetail', []).component('tagDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/tag-detail/tag-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function TagDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            var tagId = $routeParams.tagId;
            var nestedOrderBy = "path_to_file";


            var models = require(__dirname + '/business/db/sqlite/models/All.js');

            var dbQueryObject =  {
                include: [
                    {model: models.Actor, as: 'actors'},
                    {model: models.Website, as: 'websites'}

                ],
                where:{
                    id: tagId
                }


            };

            self.sceneQueryObject = {
                include: [
                    {model: models.Actor, as: 'actors', },
                    {model: models.Tag, as: 'tags',where:{id: tagId}},
                    {model: models.Website, as: 'websites'}

                ]


            };

            self.pictureQueryObject = {
                include: [
                    {model: models.Actor, as: 'actors', },
                    {model: models.Tag, as: 'tags',where:{id: tagId}},
                    {model: models.Website, as: 'websites'}

                ]


            };



            self.tag = models.Tag.findOne(dbQueryObject).then(function (res) {
                $timeout().then(function () {
                    self.tag = res;
                })

            });

            


        }]
});
