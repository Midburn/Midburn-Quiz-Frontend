app.directive('header', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'app/components/Header/Header.html',
        link: function(scope, elem, attrs) {
        }
    };
});
