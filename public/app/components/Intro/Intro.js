app.directive('intro', function($http, config) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'app/components/Intro/Intro.html',
        link: function(scope, elem, attrs) {
            var urlParams = window.location.search.substring(1).split('=');
            var uid = urlParams[1];
            var userId = config.userId || uid || 0;
            var introModal = document.getElementById('Modal'); // welcome modal
            var startBtn = document.getElementById("startBtn");

            startBtn.onclick = function() {
                introModal.style.display = "none";
                scope.start();

                // Lazy load burning man
                var theman_gif = document.querySelector('#theman-gif')
                theman_gif.src = theman_gif.attributes['data-src'].nodeValue
                setTimeout(function () {
                  document.querySelector('#theman-gif').classList.remove('hidden')
                }, 1000)
            }

            // Init the quiz game, request new game
            ;(function functionName() {
              var requestNewGame = {
                  method: 'POST',
                  url: config.API_URL + '/games/new/',
                  contentType: 'application/json',
                  dataType: 'json',
                  data: {
                      user_id: userId
                  }
              }
              $http(requestNewGame).then(function(response) {
                  // set the game model
                  Window.game = response.data;
                  startBtn.removeAttribute('disabled')
                  document.querySelector('.loader').style.display = "none"
              }, function() {
                  // failed to init
                  $("#main-page").hide();
                  alert("טעינת המשחק נכשלה, רענן את הדף\n\n Game failed to start! try to refresh")
                  return;
              });
            })()

            // Text Labels
            scope.intro = {
                title: 'משחקי הברן',
                desc: 'ברוכים הבאים למשחק הטריוויה החדש שמשגע את הפלאייה! רוצים כרטיסים? אתם חייבים לעבור אותו! איך מנצחים? עליכם לעבור 5 נושאים שקשורים למידברן, ובכל נושא לענות נכון על ' + gameVariables.numOfcurrectAnswerInStreak.toString() + ' שאלות רצופות. לרשותכם שני גלגלי הצלה לכל נושא. בהצלחה!'
            }
        }
    };
});
