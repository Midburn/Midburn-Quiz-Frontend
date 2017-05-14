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
                $('#goFS').css('top', 0).fadeIn()
                $('#goFS').click(function() {
                    requestFullScreen.call(docEl);
                    $('#goFS').fadeOut()
                })
            } else {
                cancelFullScreen.call(doc);
            }
            // Hide button interval
            var seconds = 10
            var timer = setInterval(function() {
              seconds--
              if (seconds === 0) {
                clearInterval(timer)
                // Move button to bottom
                $('#goFS').addClass('bottom').animate({
                  bottom: 0
                })
                $('#goFS.bottom > span[class!="icn-fs"]').hide()
              }
              document.querySelector('.timeout').innerText = seconds
            }, 1000)
        }
    };
});
