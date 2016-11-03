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


            self.dbQueryObject = models.Tag.get(tagId);

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


            self.tag = models.Tag.get(tagId).getJoin({
                actors: true,
                websites: true
            }).run().then(function (res) {
                self.actor = res;
            });

            


        }]
});
