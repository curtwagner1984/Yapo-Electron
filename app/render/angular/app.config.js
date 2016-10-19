app.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $locationProvider.html5Mode({enabled: false, requireBase: false});

        $routeProvider.when('/settings', {
            template: '<settings></settings>'
        }).when('/db-test', {
            template: '<db-test></db-test>'
        }).when('/scene', {
            template: '<scene-list></scene-list>'
        }).otherwise({
            template: '<db-test></db-test>'

        });
    }

]);