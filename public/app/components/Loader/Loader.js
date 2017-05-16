app.directive('loader', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'app/components/Loader/Loader.html',
        link: function(scope, elem, attrs) {
        }
    };
});
