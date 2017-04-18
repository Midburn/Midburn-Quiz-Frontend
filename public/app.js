/*
 *  Midburn Quiz app - )'( let it burn!
 * */

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

// Set-up new game
app.controller('quizInit', function($scope, $rootScope, $http, config) {

    // Get user id from url param
    userId = config.userId;

    if (userId === undefined) {
        $(function() {
            $("#game-start-wrapper").hide();
        });
        alert("User id is missing!")
        return;
    }

    $scope.Init = function(lang = "en") {

        var new_gameRequest = {
            method: 'POST',
            url: config.API_URL + '/games/new/',
            contentType: 'application/json',
            dataType: 'json',
            data: {
                language: lang,
                user_id: userId
            }
        }

        $http(new_gameRequest).then(function(response) {

            // set the game model
            Window.game = response.data;

        }, function() {
            // New game init failure
            console.error("Failed to init new game");
        });
    }
});

// Quiz mechanism

app.directive('quiz', function(quizFactory, $http, config) {
    var qnumber;
    var game = Window.game;
    var categories = Window.game.categories;

    return {
        restrict: 'AE',
        scope: {},
        templateUrl: 'templates/template.html',
        link: function(scope, elem, attrs) {

            // Quiz start init
            scope.start = function() {

                // hide intro
                $("#intro").fadeOut("fast");
                qnumber = 0;
                scope.id = 0;
                scope.quizOver = false;
                scope.inProgress = true;
                scope.categories = Window.game.categories;
                scope.nextQuestion();
            };

            // Quiz get question
            scope.getQuestion = function(category) {

                // Get question request
                var getQuestionRequest = {
                    method: 'POST',
                    url: config.API_URL + "/games/" + Window.game.token + '/new_question/',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: {
                        category: category.name
                    }
                }

                $http(getQuestionRequest).then(function(response) {

                    /* Data returned from API:
                     *  Qustion id, text, answers, category
                     * */
                    Window.currentQuestion.id = response.data.id;
                    Window.currentQuestion.question = response.data.body;
                    Window.currentQuestion.options = response.data.answers;
                    Window.currentQuestion.category = response.data.category
                        ? response.data.category.name
                        : "כללי";
                    Window.currentQuestion.answer = 0;

                    if (Window.currentQuestion) {
                        scope.qnumber = qnumber;
                        scope.question = Window.currentQuestion.question;
                        scope.options = Window.currentQuestion.options;
                        scope.answer = Window.currentQuestion.answer;
                        scope.category = Window.currentQuestion.category;
                        scope.answerMode = true;
                    } else {
                        scope.quizOver = true;
                    }

                }, function() {
                    // Get questions failure
                    console.log("Error: can't get questions from api");
                });
            };

            scope.isCategoryCompleted = function(category) {
                return category.category_completed;
            }

            scope.selectCategory = function() {
                var categories = Window.game.categories;
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];
                    if (!scope.isCategoryCompleted(category)) {
                        return category;
                    }
                }
                console.log("GAME ENDED");
            }

            scope.updateProgressBar = function(category) {
                var pages = $(".category-pagination");
                for (var i = 0; i < pages.length; i++) {
                    var pageElem = pages[i];
                    var categoryId = pageElem.getAttribute("data-category-id");
                    if (category.category_id == parseInt(categoryId)) {
                        pageElem.classList.remove("disabled");
                        pageElem.classList.add("active");
                    } else {
                        pageElem.classList.add("disabled");
                    }
                }
            }

            // Quiz next question
            scope.nextQuestion = function() {
                qnumber++;
                scope.id++;

                category = scope.selectCategory();
                scope.getQuestion(category);
                scope.updateProgressBar(category);
            };

            // Get hint
            scope.getHint = function() {
                var post_getHint = {
                    method: 'POST',
                    url: config.API_URL + "/games/" + Window.game.token + '/hint',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: {
                        question_id: Window.currentQuestion.id
                    }
                }

                $http(post_getHint).then(function(response) {

                    var hints = [];
                    for (var i = 0; i < response.data.hints.length; i++) {
                        hints.push(response.data.hints[i].id);
                    }

                    // Remove two answers
                    // $("ul#options > li input[type='radio'][value='1385'], ul#options > li input[type='radio'][value='1388']")

                    for (var i = 0; i < hints.length; i++) {
                        var answerId = hints[i];
                        var selector = "ul#options > li input[type='radio'][value='" + answerId + "']";
                        var elem = $(selector)[0];
                        elem.parentNode.parentNode.classList.add("disabled-option");
                    }
                });
            };

            // Quiz reset
            scope.reset = function() {
                scope.inProgress = false;
                scope.score = 0;
            }

            scope.isGameover = function() {
                var gameOverFlag = true;
                for (var i = 0; i < Window.game.categories.length; i++) {
                    var category = Window.game.categories[i];
                    if (!category.category_completed) {
                        gameOverFlag = false;
                        break;
                    }
                }
                return gameOverFlag;
            }

            scope.flashCorrect = function(elem, callback) {
                elem.classList.add("correct");
            }

            // Quiz check answer
            scope.checkAnswer = function(event) {

                var inputElement = event.target.lastElementChild.lastElementChild
                var userAnswerId = inputElement.value;

                Window.currentQuestion.userSelectedElement = event.target;

                if (userAnswerId === undefined) {
                    console.log("empty answer?");
                    return;
                }

                // POST user answer to API
                var postCheckAnswer = {
                    method: 'POST',
                    url: config.API_URL + "/games/" + Window.game.token + '/answer',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: {
                        question_id: Window.currentQuestion.id,
                        answer_ids: [userAnswerId]
                    }
                }

                $http(postCheckAnswer).then(function(response) {

                    // update categories model
                    var categoryString = Window.currentQuestion.category;
                    for (var i = 0; i < Window.game.categories.length; i++) {
                        var category = Window.game.categories[i];
                        if (category.name == categoryString) {
                            category.category_completed = response.data.category_completed;
                        }
                    }

                    // check if game over
                    var gameOverFlag = scope.isGameover();

                    // do different things based on API's response on user's answer
                    if (response.data.response == true) {
                        Window.currentQuestion.userSelectedElement.classList.add("correct");
                    } else {
                        Window.currentQuestion.userSelectedElement.classList.add("wrong");
                        var answerId = response.data.correct_answers[0].id;
                        var liElem = $('input[name=answer][value=' + answerId + ']').parent().parent();
                        liElem[0].classList.add("correct");
                    }

                    // if game is not over
                    if (!gameOverFlag) {
                        setTimeout(function(argument) {
                            scope.nextQuestion();
                        }, 2000);
                    } else {
                        $("#quiz-is-over-alert").toggle();
                    }
                });

                scope.answerMode = false;
            };

            scope.reset();
        }
    }
});

app.factory('quizFactory', function($http, config) {

    return {
        getQuestion: function(category) {

            // Get question request
            var get_questionsRequest = {
                method: 'POST',
                url: config.API_URL + "/games/" + Window.game.token + '/new_question/',
                contentType: 'application/json',
                dataType: 'json',
                data: {}
            }

            $http(get_questionsRequest).then(function(data) {

                var quesLevel = data.data.level;
                var quesBody = data.data.body;
                var quesAnswers = data.data.answers;

                Window.currentQuestion.question = quesBody;
                Window.currentQuestion.options = quesAnswers;
                Window.currentQuestion.answer = 0;

            }, function() {
                // Get questions failure
                //console.log("Error: can't get questions from api");
            });

            return Window.currentQuestion;
        }
    };
});

// Language translation switch config & controller

// Configuration
app.config(function($translateProvider) {

    var dic_EN = {
        TITLE: 'Welcome to the Midburn quiz',
        DESC: 'In order to be eligible for a ticket for Midburn 2016, you must first show that you care about our culture, by answering 10 questions correctly.',
        INFO: 'Wait, what’s Midburn?',
        BTN_START_GAME: 'Start Game'
    };
    var dic_HE = {
        TITLE: 'ברוכים הבאות לשאלון מידברן',
        DESC: 'על מנת להיות זכאי\\ת לכרטיס למידברן 2016, ראשית את\\ה חייב\\ת להראות שאכפת לך מהתרבות שלנו, על ידי מענה של 10 שאלות בצורה נכונה.',
        INFO: 'רגע, מה זה מידברן?',
        BTN_START_GAME: 'התחל במשחק'
    };

    // English conf
    $translateProvider.translations('en', dic_EN);

    // Hebrew conf
    $translateProvider.translations('he', dic_HE);

    // Default language
    $translateProvider.preferredLanguage('he');
});

// Language Support Controller
app.controller('LangController', function($scope, $translate) {

    // Lang switch method
    $scope.changeLanguage = function(key) {
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

app.controller('TemplateController', function($scope) {

    // Current Year
    $scope.CurrentYear = new Date().getFullYear();

    // Theme Name
    $scope.ThemeName = "Abracadabra";

    // Footer links => {Text: "text", Href: "href", Class: "class"}
    $scope.Links = [
        {
            Text: "Help us make it better",
            Href: "//github.com/Midburn/Midburn-Quiz-Frontend",
            Class: "link-special"
        }, {
            Text: "Midburn Website",
            Href: "//midburn.org/en/",
            Class: ""
        }, {
            Text: "About The Event",
            Href: "//midburn.org/en-event/",
            Class: ""
        }, {
            Text: "The Ten Principles",
            Href: "//midburn.org/en-ten-principles/",
            Class: ""
        }
    ];
});
