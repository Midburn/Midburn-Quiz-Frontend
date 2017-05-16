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
            var fullscreen_btn = document.querySelector('#goFS')

            if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio) {
                document.documentElement.style.height = (window.outerHeight / window.devicePixelRatio) + 'px';
            }
            setTimeout(window.scrollTo(1, 1), 0);

            if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                // show fullscreen button
                fullscreen_btn.addEventListener('click', function() {
                    requestFullScreen.call(docEl);
                    ga_notify('buttons', 'fullscreen', 'player wants fullscreen') // Analytics event
                })
            } else {
                cancelFullScreen.call(doc);
            }
        }
    };
});
