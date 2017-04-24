// Set-up new game
app.controller('Quiz', function($scope, $http, config) {
    var userId = config.userId || new URLSearchParams(window.location.search).get('uid');

    if (userId === undefined) {
        $("#game-start-wrapper").hide();
        alert("User id is missing!")
        return;
    }

    $scope.Init = function(lang = "en") {
        var request_new_game = {
            method: 'POST',
            url: config.API_URL + '/games/new/',
            contentType: 'application/json',
            dataType: 'json',
            data: {
                language: lang,
                user_id: userId
            }
        }

        $http(request_new_game).then(function(response) {
            // set the game model
            Window.game = response.data;
        }, function() {
            // New game init failure
            console.error("Failed to init new game");
        });
    }
});
