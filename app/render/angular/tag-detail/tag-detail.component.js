var models = require(__dirname + '/business/db/models/all.js');
angular.module('tagDetail', []).component('tagDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/tag-detail/tag-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope','$routeParams',
        function TagDetailController($scope, $location, $timeout, $rootScope, $routeParams) {
            
            var self = this;

            var tagId = $routeParams.tagId;

            $scope.parent_scenes = new Promise(function (resolve, reject) {

                    self.tag = models.Tag.get(tagId).getJoin({scenes: {actors: true, tags: true, websites: true}, websites: true}).run().then(function (res) {

                        $timeout(function () {
                            self.tag = res;
                            resolve(res.scenes)
                        })

                    })
                    
                })
            ;
            
            
            
            
            
            

        }]
});
