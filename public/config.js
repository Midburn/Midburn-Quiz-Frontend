var config = {
    "api_url": "https://burner-games-staging.herokuapp.com/api/v1"
}
var app = angular.module('quizApp', []);

// Constants
app.constant('config', {
    API_URL: config.api_url,
    userId: config.user_id
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
