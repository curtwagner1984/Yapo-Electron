app.config(['$locationProvider', '$routeProvider', '$mdAriaProvider',
    function config($locationProvider, $routeProvider, $mdAriaProvider) {

        $mdAriaProvider.disableWarnings();

        $locationProvider.hashPrefix('!');

        $locationProvider.html5Mode({enabled: false, requireBase: false});

        $routeProvider.when('/settings', {
            template: '<settings></settings>'
        }).when('/db-test', {
            template: '<db-test></db-test>'
        }).when('/scene', {
            template: '<scene-list></scene-list>'
        }).when('/scene/:sceneId', {
            template: '<scene-detail></scene-detail>'
        }).when('/actor', {
            template: '<actor-list></actor-list>'
        }).when('/actor/:actorId', {
            template: '<actor-detail></actor-detail>'
        }).when('/tag', {
            template: '<tag-list></tag-list>'
        }).when('/tag/:tagId', {
            template: '<tag-detail></tag-detail>'
        }).when('/website', {
            template: '<website-list></website-list>'
        }).when('/website/:websiteId', {
            template: '<website-detail></website-detail>'
        }).when('/picture/', {
            template: '<picture-list></picture-list>'
        }).when('/folder/', {
            template: '<folder-list></folder-list>'
        }).otherwise({
            template: '<db-test></db-test>'

        });
    }

]);