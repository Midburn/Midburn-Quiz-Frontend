/**
 * Midburn Quiz app - )'( let it burn!
 */
 var gameVariables =  {numOfcurrectAnswerInStreak:2};





// Quiz question directive
app.directive('quiz', function(quizFactory, $http, config) {

    var game = Window.game;
    var categories = Window.game.categories;
    var canGetHint = true;
    var canSkipQuestion = true;
    var correctStreak = 0;

    var popupmodal = document.getElementById('popupModal');
    var endPopupmodal = document.getElementById('quiz-is-over-alert');
    var modal = document.getElementById('Modal');
    var btn = document.getElementById("startBtn");
     var gameOverPopUp = document.getElementById("quiz-is-over-alert");
    var disableAnswerLable = false;

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/templates/template.html',
        link: function(scope, elem, attrs) {

            scope.setupPage = function(){
                console.log("setupPage")
                // make sure played in landscape mode
                scope.changeView = window.innerHeight > window.innerWidth
                console.log(scope.changeView)
                var rotateModal = document.getElementById('change-viewport-alert');
                rotateModal.style.display = (scope.changeView) ? "block" : "none"

                // hide address bar
                if(document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio)
                    document.documentElement.style.height=(window.outerHeight/window.devicePixelRatio)+'px';
                    setTimeout(window.scrollTo(1,1),0);
                }

            // window.addEventListener("load",function(){;});
            window.addEventListener("orientationchange",function(){scope.setupPage();});
            window.addEventListener("resize",function(){scope.setupPage();});

            scope.setupPage();

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
                    Window.currentQuestion.category = response.data.category ?
                    response.data.category.name :
                        "כללי";
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
                scope.passedQuiz= true;

                 setTimeout(function(argument) {
                                     $("#quiz-is-over-alert").toggle();
                                    gameOverPopUp = document.getElementById("quiz-is-over-alert");
                                    gameOverPopUp.style.display = "block";  }, 1000);

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
            scope.resetGame = function() {
                alert("reseting game");
                passedQuiz = false;
                 gameOverPopUp.style.display = "none";
                for (var i = 0; i < Window.game.categories.length; i++) {
                    Window.game.categories[i].category_completed = false;
                }
                scope.start();
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

// Language translation configuration
app.config(function($translateProvider) {
    var dic_EN = {
        TITLE: 'Welcome to the Midburn quiz',
        DESC: 'In order to be eligible for a ticket for Midburn 2016, you must first show that you care about our culture, by answering 10 questions correctly.',
        INFO: 'Wait, what’s Midburn?',
        BTN_START_GAME: 'Start Game'
    };
    var dic_HE = {
        TITLE: 'משחקי הברן',
        DESC: "ברוכים הבאים למשחק הטריוויה החדש שיתן מענה לשאלה שמעסיקה את כולם: האם אתם ברנרים אמיתיים? איך מנצחים? פשוט:עליכם לעבור 5 נושאים שקשורים למידברן, ובכל אחד לענות נכון על "+   + gameVariables.numOfcurrectAnswerInStreak.toString()+ " שאלות רצופות תוכלו להשתמש בשני גלגלי הצלה בכל נושא. בהצלחה!",
        INFO: 'רגע, מה זה מידברן?',
//        BTN_START_GAME: 'ז'
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

app.controller('FooterController', function($scope) {
    // Current Year
    $scope.CurrentYear = new Date().getFullYear();
    // Theme Name
    $scope.ThemeName = "Abracadabra";
    // Footer links => {Text: "text", Href: "href", Class: "class"}
    $scope.Links = [{
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
    }];
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
