/**
 * Midburn Quiz app - )'( let it burn!
 */
 var gameVariables =  {numOfcurrectAnswerInStreak:3};

// Quiz question directive
app.directive('quiz', function(quizFactory, $http, config, $location) {

    var game = Window.game;
    var categories = Window.game.categories;
    var canGetHint = true;
    var canSkipQuestion = true;
    var correctStreak = 0;

    var popupmodal = document.getElementById('popupModal');
    var endPopupmodal = document.getElementById('quiz-is-over-alert');
    var modal = document.getElementById('Modal'); // welcome modal
    var btn = document.getElementById("startBtn");
    var gameOverPopUp = document.getElementById("quiz-is-over-alert");
    var disableAnswerLable = false;

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/templates/template.html',
        link: function(scope, elem, attrs) {
            // click on the guide link
            var guide_link = document.querySelector('#linkto_guide')
            guide_link.addEventListener('click', function() {
              ga_notify('links', 'guide', 'player clicked on guide link')
            })

            btn.onclick = function() {
                modal.style.display = "none";
                scope.start();
            }
            // Quiz start init
            scope.start = function() {
                $("#intro").fadeOut("fast");

                scope.id = 0;
                scope.quizOver = false;
                scope.passedQuiz = false;
                scope.inProgress = true;
                scope.categories = Window.game.categories;
                scope.nextQuestion();
                scope.answersToCompleateCategory = new Array(gameVariables.numOfcurrectAnswerInStreak);
                scope.resetQuestionStreakIndicator();
                scope.IsClickEnable = true;
                scope.gameStarted = true;
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

            scope.categoryToHebrewName = function(category) {
                var categories = {
                    "survival_guide": "מדריך ההישרדות",
                    "principles": "עשרת העקרונות",
                    "orientation": "גופים והתמצאות באירוע",
                    "leave_no_trace": "חשל\"ש",
                    "safe_zone": "גבולות אישיים",
                };

                if (categories && categories[category]) {
                    return categories[category];
                } else {
                    console.log("couldn't find category: " + category);
                    return "כללי";
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
                    Window.currentQuestion.category = response.data.category ? scope.categoryToHebrewName(response.data.category.name) : "כללי";
                    Window.currentQuestion.answer = 0;
                    scope.currentCategory = Window.currentQuestion.category;


                    if (Window.currentQuestion) {
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
                        return category;
                    } else {
                        if (scope.categoryToHebrewName(category.name) ==  scope.currentCategory) {

                            canGetHint = true;
                            canSkipQuestion = true;

                        }
                    }
                }
                console.log("GAME ENDED");
                scope.passedQuiz= true;

                 setTimeout(function(argument) {
                                     $("#quiz-is-over-alert").toggle();
                                    gameOverPopUp = document.getElementById("quiz-is-over-alert");
                                    gameOverPopUp.style.display = "block";
                                     scope.passTheTest();}, 1000);

            }

            // Quiz next question
            scope.nextQuestion = function() {
                scope.id++;
                category = scope.selectCategory();
                if( scope.passedQuiz == true) {
                 scope.getQuestion( Window.game.categories[Window.game.categories.length -1]);

                    return;
                }
                scope.getQuestion(category);
                scope.IsClickEnable = true;
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

//            scope.isGameover = function() {
//                var gameOverFlag = true;
//                for (var i = 0; i < Window.game.categories.length; i++) {
//                    var category = Window.game.categories[i];
//                    if (!category.category_completed) {
//                        gameOverFlag = false;
//                        break;
//                    }
//                }
//                return gameOverFlag;
//            }

            scope.flashCorrect = function(elem, callback) {
                elem.classList.add("correct");
            }

            // Quiz check answer
            scope.checkAnswer = function(event) {
             scope.IsClickEnable = false;
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
                   // gameOverFlag = response.data.game_completed

                    // do different things based on API's response on user's answer
                    if (response.data.response == true) {
                        Window.currentQuestion.userSelectedElement.classList.add("correct");
                        scope.answersToCompleateCategory[correctStreak] = "achieved";
                        correctStreak++;
                        if (correctStreak < gameVariables.numOfcurrectAnswerInStreak) {
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


                        setTimeout(function(argument) {
                            // game is'nt over, new question

                            scope.nextQuestion();
                        }, 2000);

                });
                scope.answerMode = false;

            };
            //I think its redundent function -- Liad
            scope.reset();


           scope.passTheTest = function() {
                /**
                 * Win the game! notify the server of passing the quiz
                 */
                if (Window.game.user_id != 0) {
                  var PASS_ENDPOINT = config.API_URL + "/games/" + Window.game.token + '/new_question/'
                  $http.post(PASS_ENDPOINT).then(function(res) {

                  }, function() {
                      alert("error with request");
                  });
                }
            }
            scope.resetGame = function() {
                passedQuiz = false;
                 gameOverPopUp.style.display = "none";
                for (var i = 0; i < Window.game.categories.length; i++) {
                    Window.game.categories[i].category_completed = false;
                }
                scope.start();
            }
            scope.goToTickets = function() {
                if (Window.game.user_id != 0) {
                    window.location.href = 'https://profile-test.midburn.org/he/user/' + Window.game.user_id + '/tickets';
                } else {
                    window.location.href = 'https://profile-test.midburn.org/he';
                }
            }
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

// filter for reverse list
app.filter('reverse', function() {
    return function(items) {
        if (items)
            return items.slice().reverse();
        else
            return [];
    };
});
