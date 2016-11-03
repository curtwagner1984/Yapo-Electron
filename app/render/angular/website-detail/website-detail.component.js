var models = require(__dirname + '/business/db/models/all.js');
angular.module('websiteDetail', []).component('websiteDetail', {
        // Note: The URL is relative to our `index.html` file
        templateUrl: 'render/angular/website-detail/website-detail.template.html',
        bindings: {},
        controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
            function WebsiteDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

                var self = this;

                var websiteId = $routeParams.websiteId;


                self.dbQueryObject = models.Website.get(websiteId);

                self.dbQueryGetJoinObject = {
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

                self.getField = 'scenes';


                self.website = models.Website.get(websiteId).getJoin({
                    tags: true
                }).run().then(function (res) {

                    $timeout(function () {
                        self.website = res;

                    })


                });
            }]
    }
);
