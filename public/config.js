var getConfigFromConfigFile = function() {
    var _config;
    $.ajax({
        url: 'config.json',
        success: function(data) {
            _config = data;
        },
        async: false,
        dataType: 'json'
    });
    return _config;
};

var configFile = getConfigFromConfigFile();
var app = angular.module('quizApp', ['ngResource', 'pascalprecht.translate']);

// Constants
app.constant('config', {
    API_URL: configFile.api_url,
    userId: configFile.user_id
});

// Init question-answer vars
Window.currentQuestion = {
    id: null,
    question: null,
    options: null,
    userSelectedElement: null,
    answer: null,
    category: null
}

Window.game = {
    token: null,
    categories: [],
    hintBtn: $("button#btnHint")
}
