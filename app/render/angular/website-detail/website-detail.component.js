
angular.module('websiteDetail', []).component('websiteDetail', {
        // Note: The URL is relative to our `index.html` file
        templateUrl: 'render/angular/website-detail/website-detail.template.html',
        bindings: {},
        controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
            function WebsiteDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

                var self = this;

                var websiteId = $routeParams.websiteId;


                var models = require(__dirname + '/business/db/sqlite/models/All.js');
                var sequielize = require(__dirname + '/business/db/sqlite/sequelize.js');
                var auxFunc = require(__dirname + '/business/util/auxFunctions.js');

                var dbQueryObject =  {

                    include: [
                        {model: models.Tag, as: 'tags'},
                        {model: models.Actor, as: 'actors'}

                    ],
                    where:{
                        id: websiteId
                    }


                };

                self.sceneQueryObject = {
                    where: {
                        // subquery that will select all picture IDs from through table where tag Id is the tag we want...
                        id: { $in: sequielize.Sequelize.literal(auxFunc.generateSQLQueryForFilteringIDsFromThroughTable("Scene_id", "Scene_website", "Website_id", websiteId)) }
                    },
                    include: [
                        {model: models.Actor, as: 'actors' },
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites'}

                    ]


                };

                self.pictureQueryObject = {
                    where: {
                        // subquery that will select all picture IDs from through table where tag Id is the tag we want...
                        id: { $in: sequielize.Sequelize.literal(auxFunc.generateSQLQueryForFilteringIDsFromThroughTable("Picture_id", "Picture_website", "Website_id", websiteId)) }
                    },
                    include: [
                        {model: models.Actor, as: 'actors' },
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites'}

                    ]


                };



                self.website = models.Website.findOne(dbQueryObject).then(function (res) {
                    $timeout().then(function () {
                        self.tag = res;
                    })

                });
            }]
    }
);
