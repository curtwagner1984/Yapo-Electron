
angular.module('websiteDetail', []).component('websiteDetail', {
        // Note: The URL is relative to our `index.html` file
        templateUrl: 'render/angular/website-detail/website-detail.template.html',
        bindings: {},
        controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
            function WebsiteDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

                var self = this;

                var websiteId = $routeParams.websiteId;


                var models = require(__dirname + '/business/db/sqlite/models/All.js');

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
                    include: [
                        {model: models.Actor, as: 'actors' },
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites', where:{id: websiteId}}

                    ]


                };

                self.pictureQueryObject = {
                    include: [
                        {model: models.Actor, as: 'actors' },
                        {model: models.Tag, as: 'tags'},
                        {model: models.Website, as: 'websites', where:{id: websiteId}}

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
