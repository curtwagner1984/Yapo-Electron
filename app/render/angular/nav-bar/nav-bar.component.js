angular.module('navBar', []).component('navBar', {
    // Note: The URL is relative to our `index.html` file
    templateUrl: 'render/angular/nav-bar/nav-bar.template.html',
    bindings: {},
    controller: ['$scope','$location',
        function NavBarController($scope, $location) {


            var self = this;
            
            self.test = "This is a test.";
            self.currentLocation = $location.path();
        }
    ]
});