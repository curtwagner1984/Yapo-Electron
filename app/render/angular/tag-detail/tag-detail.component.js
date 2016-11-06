
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
            var sequielize = require(__dirname + '/business/db/sqlite/sequelize.js');
            var auxFunc = require(__dirname + '/business/util/auxFunctions.js');

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
                where: {
                    // subquery that will select all picture IDs from through table where tag Id is the tag we want... '(SELECT DISTINCT "Scene_id" FROM "Scene_tag" WHERE Tag_id =' + tagId +' )'
                    id: { $in: sequielize.Sequelize.literal(auxFunc.generateSQLQueryForFilteringIDsFromThroughTable("Scene_id", "Scene_tag", "Tag_id", tagId)) }
                },
                include: [
                    {model: models.Actor, as: 'actors'},
                    {model: models.Tag, as: 'tags'},
                    {model: models.Website, as: 'websites'}

                ]


            };

            self.pictureQueryObject = {
                where: {
                    // subquery that will select all picture IDs from through table where tag Id is the tag we want...
                    id: { $in: sequielize.Sequelize.literal(auxFunc.generateSQLQueryForFilteringIDsFromThroughTable("Picture_id", "Picture_tag", "Tag_id", tagId)) }
                },
                include: [
                    {model: models.Actor, as: 'actors'},
                    {model: models.Tag, as: 'tags'},
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
