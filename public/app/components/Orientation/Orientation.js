app.directive('orientationAlert', function () {
    return {
        restrict: 'A',
        templateUrl: 'app/components/Orientation/Alert.html',
        link: function (scope, elem, attrs) {
            var checkOrientation = function () {
                if (window.innerHeight > window.innerWidth) {
                    $('#main-page').hide()
                    $('#change-viewport-alert').show()
                } else {
                    $('#main-page').show()
                    $('#change-viewport-alert').hide()
                }
            }

            window.addEventListener("orientationchange", function () {
                checkOrientation()
            })

            checkOrientation()
        }
    };
});
