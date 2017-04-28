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
