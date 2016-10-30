var models = require(__dirname + '/business/db/models/all.js');
angular.module('tagDetail', []).component('tagDetail', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/tag-detail/tag-detail.template.html',
    bindings: {},
    controller: ['$scope', '$location', '$timeout', '$rootScope', '$routeParams',
        function TagDetailController($scope, $location, $timeout, $rootScope, $routeParams) {

            var self = this;

            var tagId = $routeParams.tagId;
            var nestedOrderBy = "path_to_file";

            $scope.parent_scenes = new Promise(function (resolveScenes, reject) {

                    $scope.parent_pictures = new Promise(function (resolvePictures, reject) {

                        self.tag = models.Tag.get(tagId).getJoin({
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
                                self.tag = res;
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
