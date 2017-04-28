/**
 * Midburn Quiz app - )'( let it burn!
 */
var gameVariables =  {numOfcurrectAnswerInStreak:2};

// Quiz question directive
app.directive('quiz', function(quizFactory, $http, config) {
    var qnumber;
    var game = Window.game;
    var categories = Window.game.categories;
    var canGetHint = true;
    var canSkipQuestion = true;
    var correctStreak = 0;

    var popupmodal = document.getElementById('popupModal');
    var modal = document.getElementById('Modal');
    var btn = document.getElementById("startBtn");
    var gameOverPopUp = document.getElementById("quiz-is-over-alert");

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/templates/template.html',
        link: function(scope, elem, attrs) {

            scope.setupPage = function() {
                // make sure played in landscape mode
                scope.changeView = window.innerHeight > window.innerWidth
                var rotateModal = document.getElementById('change-viewport-alert');
                rotateModal.style.display = (scope.changeView)
                    ? "block"
                    : "none"

                // hide address bar
                if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio)
                    document.documentElement.style.height = (window.outerHeight / window.devicePixelRatio) + 'px';
                setTimeout(window.scrollTo(1, 1), 0);
            }

            // listener for screen orientation change
            window.addEventListener("orientationchange", function() {
                scope.setupPage();
            });
            window.addEventListener("resize", function() {
                scope.setupPage();
            });

            scope.setupPage();

            btn.onclick = function() {
                modal.style.display = "none";
                scope.start();
            }
            // Quiz start init
            scope.start = function() {
                $("#intro").fadeOut("fast");
                qnumber = 0;
                scope.id = 0;
                scope.quizOver = false;
                scope.passedQuiz = false;
                scope.inProgress = true;
                scope.categories = Window.game.categories;
                scope.nextQuestion();
                scope.answersToCompleateCategory = new Array(gameVariables.numOfcurrectAnswerInStreak);
                scope.resetQuestionStreakIndicator();
            };
            scope.resetQuestionStreakIndicator = function() {
                for (i = 0; i < gameVariables.numOfcurrectAnswerInStreak; i++) {
                    var state = 'not-achieved';
                    if (i == 0) {
                        scope.answersToCompleateCategory[i] = "in-progress";
                    } else {
                        scope.answersToCompleateCategory[i] = state;
                    }
                }
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
                    scope.currentCategory = Window.currentQuestion.category;

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
            scope.checkCanGetHint = function() {
                return canGetHint;
            }
            scope.checkCanSkipQuestion = function() {
                return canSkipQuestion;
            }
            scope.isCategoryCompleted = function(category) {
                if (category.category_completed == true) {
                    return true;
                }
                if (correctStreak === gameVariables.numOfcurrectAnswerInStreak) {
                    correctStreak = 0;
                    category.category_completed = true;
                    scope.resetQuestionStreakIndicator();
                    return true;
                } else {
                    category.category_completed = false;
                    return false;
                }
                //return category.category_completed;
            }

            scope.selectCategory = function() {
                var categories = Window.game.categories;
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];

                    if (!scope.isCategoryCompleted(category)) {
                        // alert("not done!!! " + category.name);
                        return category;
                    } else {
                        if (category.name == scope.currentCategory) {
                            canGetHint = true;
                            canSkipQuestion = true;
                            // alert("done " + category.name);
                        }
                    }
                }
                console.log("GAME ENDED");
                scope.passedQuiz = true;
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
                var postHint = {
                    method: 'POST',
                    url: config.API_URL + "/games/" + Window.game.token + '/hint',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: {
                        question_id: Window.currentQuestion.id
                    }
                }

                $http(postHint).then(function(response) {
                    var hints = [];
                    for (var i = 0; i < response.data.hints.length; i++) {
                        hints.push(response.data.hints[i].id);
                    }
                    // Disable two answer options
                    for (var i = 0; i < hints.length; i++) {
                        var answerId = hints[i];
                        var selector = "ul#options > li input[type='radio'][value='" + answerId + "']";
                        var elem = $(selector)[0];
                        elem.parentNode.parentNode.classList.add("disabled-option");
                    }
                });
                canGetHint = false;
            };
            scope.skipQuestion = function() {
                scope.nextQuestion();
                canSkipQuestion = false;
            }

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
                var inputElement = event.target.lastElementChild.lastElementChild;
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
                            //category.category_completed = response.data.category_completed;
                        }
                    }

                    // check if game over
                    // var gameOverFlag = scope.isGameover();
                    gameOverFlag = response.data.game_completed

                    // do different things based on API's response on user's answer
                    if (response.data.response == true) {
                        Window.currentQuestion.userSelectedElement.classList.add("correct");
                        scope.answersToCompleateCategory[correctStreak] = "achieved";
                        correctStreak++;
                        if (correctStreak < Window.game.numOfcurrectAnswerInStreak) {
                            scope.answersToCompleateCategory[correctStreak] = "in-progress";
                        }
                    } else {
                        Window.currentQuestion.userSelectedElement.classList.add("wrong");
                        var answerId = response.data.correct_answers[0].id;
                        var liElem = $('input[name=answer][value=' + answerId + ']').parent().parent();
                        liElem[0].classList.add("correct");
                        correctStreak = 0;
                        scope.resetQuestionStreakIndicator();
                    }

                    if (!gameOverFlag) {
                        setTimeout(function(argument) {
                            // game is'nt over, new question
                            scope.nextQuestion();
                        }, 2000);
                    } else {
                        // game is over, notify drupal
                        passTheTest()
                        $("#quiz-is-over-alert").toggle();
                    }
                });
                scope.answerMode = false;
            };
            scope.reset();

            var passTheTest = function() {
                /**
                 * Win the game! get drupal's CSRF token then notify winning
                 * if CSRF unavailable, user's session could be ended,
                 * request to login and get new session! then try to notify.
                 */
                var TOKEN_URL = "https://profile-test.midburn.org/en/services/session/token"
                $http.get(TOKEN_URL).then(function(res) {
                    // get token
                    notify(res)
                }, function() {
                    // token unavailable, login
                    login(notify)
                });

                var notify = function(TOKEN) {
                    // notify to drupal  about winning
                    var PASS_URL = "https://profile-test.midburn.org/en/api/games/" + Window.game.user_id + "/pass"
                    var config = {
                        headers: {
                            'x-csrf-token': TOKEN
                        }
                    }
                    $http.post(PASS_URL, null, config).then(function(res) {
                        // notify succeed
                        console.log(res);
                    }, errorCallback);
                }

                var login = function(callback) {
                    var LOGIN_URL = "https://profile-test.midburn.org/en/api/user/login"
                    var data = {
                        "username": "sir_ruvzi@hotmail.com",
                        "password": "WholeNew1"
                    }
                    $http.post(LOGIN_URL, data, null).then(function(res) {
                        var TOKEN = res.getElementsByTagName('result')[0].textContent
                        callback(TOKEN)
                    }, function() {
                        // login failed!
                    })
                }
            }
        }
    }
});

app.factory('quizFactory', function($http, config) {
    return {
        getQuestion: function(category) {
            // Get question request
            var getQuestionsRequest = {
                method: 'POST',
                url: config.API_URL + "/games/" + Window.game.token + '/new_question/',
                contentType: 'application/json',
                dataType: 'json',
                data: {}
            }

            $http(getQuestionsRequest).then(function(data) {
                var quesLevel = data.data.level;
                var quesBody = data.data.body;
                var quesAnswers = data.data.answers;
                Window.currentQuestion.question = quesBody;
                Window.currentQuestion.options = quesAnswers;
                Window.currentQuestion.answer = 0;
            }, function() {
                // Get questions failure
            });
            return Window.currentQuestion;
        }
    };
});

// filter for reverse list
app.filter('reverse', function() {
    return function(items) {
        if (items)
            return items.slice().reverse();
        else
            return [];
        }
    ;
});
