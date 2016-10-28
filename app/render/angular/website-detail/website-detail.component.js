var models = require(__dirname + '/business/db/models/all.js');
angular.module('websiteDetail', []).component('websiteDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/website-detail/website-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function WebsiteDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var websiteId = $routeParams.websiteId;

            $scope.parent_scenes = new Promise(function (resolve, reject) {

                    self.website = models.Website.get(websiteId).getJoin({scenes: {actors: true, tags: true, websites: true}, tags: true}).run().then(function (res) {

                        $timeout(function () {
                            self.website = res;
                            resolve(res.scenes)
                        })

                    })
                    
                })
            ;
            
            
            
            
            
            

        }]
});
