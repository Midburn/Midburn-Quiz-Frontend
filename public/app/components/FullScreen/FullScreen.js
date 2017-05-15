app.directive('fullScreen', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'app/components/FullScreen/FullScreen.html',
        link: function(scope, elem, attrs) {
            var doc = window.document;
            var docEl = doc.documentElement;
            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                // show fullscreen button
                $('#goFS').click(function() {
                    requestFullScreen.call(docEl);
                })
            } else {
                cancelFullScreen.call(doc);
            }
        }
    };
});
