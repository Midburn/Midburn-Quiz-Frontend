app.directive('quizHeader', function () {
    return {
        restrict: 'A',
        templateUrl: 'app/components/Header/Header.html',
        link: function (scope, elem, attrs) {

            var doc = window.document;
            var docEl = doc.documentElement;

            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen ||
                docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen ||
                doc.msExitFullscreen;


            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement &&
                !doc
                .msFullscreenElement) {
                // show fullscreen button
                $('#goFS').fadeIn()

                $('#goFS').click(function () {
                    requestFullScreen.call(docEl);
                    $('#goFS').fadeOut()
                })

            } else {
                cancelFullScreen.call(doc);
            }

            setTimeout(function () {
                $('#goFS').fadeOut()
            }, 5000)
        }
    };
});
