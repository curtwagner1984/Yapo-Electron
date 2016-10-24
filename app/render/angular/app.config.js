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
        }).otherwise({
            template: '<db-test></db-test>'

        });
    }

]);