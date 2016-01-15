/*
 *  Midburn 2016 Abracadabra Quiz app - )'( let it burn!
 *
 *  Back-end: Elad
 *  Front-end: Nate
 *  Design: Nir
 *
 * */

var app = angular.module('quizApp', ['ngResource', 'pascalprecht.translate']);

//
// Variables
var gameToken = "";
var userId = 0;
var sessionToken = "";

//
// Constants
app.constant('CON', {

    // API Url
    API_URL: "//burner-games.herokuapp.com/api/v1/",

    // The correct answers client needs to reach to pass our quizzy
    correctAnswers: 10
});

//
// Init question-answer vars
var gameQuestions = {
    id: null,
    question: null,
    options: null,
    answer: null
}

//
// Set-up new game
app.controller('quizInit', function ($scope, $http, CON) {

    // Get user id from url param
    userId = getUrlParams('userId');

    // New game request
    if (userId !== undefined)
        $scope.Init = function () {
            var new_gameRequest = {
                method: 'POST',
                url: CON.API_URL + '/games/new/',
                contentType: 'application/json',
                dataType: 'json',
                data: '{"user_id": ' + userId + '}'
            }

            $http(new_gameRequest).then(function (data) {

                // If Success, here is the received token.
                gameToken = data.data.token;

            }, function () {
                // New game init failure
                console.log("Error: failed to init new game");
            });

        }
    else {
        $(function(){$("#game-start-wrapper").hide();});
        alert("User id is missing!")
    }
    ;
});

//
// Quiz mechanism
//
app.directive('quiz', function (quizFactory, $http, CON) {
    var qnumber;
    var correctAnswers;

    return {
        restrict: 'AE',
        scope: {},
        templateUrl: 'statics/template.html',
        link: function (scope, elem, attrs) {

            // Quiz start init
            scope.start = function () {

                // hide intro
                $("#intro").fadeOut("fast");
                correctAnswers = 0;
                qnumber = 1;
                scope.id = 0;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.getQuestion();
            };

            // Quiz get question
            scope.getQuestion = function () {

                // Get question request
                var get_questionsRequest = {
                    method: 'POST',
                    url: CON.API_URL + "/games/" + gameToken + '/new_question/',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: '{}'
                }

                $http(get_questionsRequest).then(function (data) {
                    console.log(data.data);
                    gameQuestions.id = data.data.id;
                    gameQuestions.question = data.data.body;
                    gameQuestions.options = data.data.answers;
                    gameQuestions.answer = 0;

                    if (gameQuestions) {
                        scope.qnumber = qnumber;
                        scope.question = gameQuestions.question;
                        scope.options = gameQuestions.options;
                        scope.answer = gameQuestions.answer;
                        scope.answerMode = true;
                    } else {
                        scope.quizOver = true;
                    }

                }, function () {
                    // Get questions failure
                    console.log("Error: can't get questions from api");
                });

            };

            // Quiz next question
            scope.nextQuestion = function () {
                qnumber++;
                scope.id++;
                scope.getQuestion();
            };

            // Quiz reset
            scope.reset = function () {
                scope.inProgress = false;
                scope.score = 0;
            }

            // Quiz check answer
            scope.checkAnswer = function () {

                if (!$('input[name=answer]:checked').length) {
                    $('#quiz-alert').toggle();
                    return;
                }

                var UserAnswer = $('input[name=answer]:checked').val();

                // POST user answer to API
                var post_checkAnswer = {
                    method: 'POST',
                    url: CON.API_URL + "/games/" + gameToken + '/answer',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: '{"question_id": "' + gameQuestions.id + '", "answer_ids":["' + UserAnswer + '"]}'
                }

                $http(post_checkAnswer).then(function (data) {
                    correctAnswers = data.data.game.answered_correctly;
                    console.log("Correct Answers: " + correctAnswers);
                });

                // Call for the next question
                if (correctAnswers < CON.correctAnswers)
                    this.nextQuestion();
                else {

                    // Quiz is over - pass token to ticket system
                    $("#quiz-is-over").toggle();
                }

                scope.answerMode = false;
            };

            scope.reset();
        }
    }
});

app.factory('quizFactory', function ($http, CON) {

    return {
        getQuestion: function (id) {

            // Get question request
            var get_questionsRequest = {
                method: 'POST',
                url: CON.API_URL + "/games/" + gameToken + '/new_question/',
                contentType: 'application/json',
                dataType: 'json',
                data: '{}'
            }

            $http(get_questionsRequest).then(function (data) {

                var quesLevel = data.data.level;
                var quesBody = data.data.body;
                var quesAnswers = data.data.answers;

                gameQuestions.question = quesBody;
                gameQuestions.options = quesAnswers;
                gameQuestions.answer = 0;

            }, function () {
                // Get questions failure
                console.log("Error: can't get questions from api");
            });

            return gameQuestions;

            if (id < gameQuestions.length) {
                return gameQuestions[id];
            } else {
                return false;
            }
        }
    };
});

// Get url params method
var getUrlParams = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

//
// Language translation switch config & controller
//

// Configuration
app.config(function ($translateProvider) {

    var dic_EN = {
        TITLE: 'Welcome to the Midburn quiz',
        DESC: 'In order to be eligible for a ticket for Midburn 2016, you must first show that you care about our culture, by answering 10 questions correctly.',
        INFO: 'Wait, what’s Midburn?',
        BTN_START_GAME: 'Start Game'
    };
    var dic_HE = {
        TITLE: 'ברוכים הבאות לשאלון מידברן',
        DESC: 'על מנת להיות זכאי\ת לכרטיס למידברן 2016, ראשית את\ה חייב\ת להראות שאכפת לך מהתרבות שלנו, על ידי מענה של 10 שאלות בצורה נכונה.',
        INFO: 'רגע, מה זה מידברן?',
        BTN_START_GAME: 'התחלה במשחק'
    };

    // English conf
    $translateProvider.translations('en', dic_EN);

    // Hebrew conf
    $translateProvider.translations('he', dic_HE);

    // Default language
    $translateProvider.preferredLanguage('en');
});


// Controller
app.controller('LangController', function ($scope, $translate) {

    // Lang switch method
    $scope.changeLanguage = function (key) {
        $translate.use(key);
        switch (key) {
            case 'en':
            {
                $("body").removeClass("lanHE");
                $("body").addClass("lanEN");
                break;
            }
            case 'he':
            {
                $("body").removeClass("lanEN");
                $("body").addClass("lanHE");
                break;
            }
        }
    };
});