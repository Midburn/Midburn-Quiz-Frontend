// Intro ctrl
app.controller('IntroController', function($scope) {
    $scope.intro = {
        title: 'משחקי הברן',
        desc: 'ברוכים הבאים למשחק הטריוויה החדש שמשגע את הפלאייה! רוצים כרטיסים? אתם חייבים לעבור אותו! איך מנצחים? עליכם לעבור 5 נושאים שקשורים למידברן, ובכל נושא לענות נכון על ' + gameVariables.numOfcurrectAnswerInStreak.toString() + ' שאלות רצופות. לרשותכם שני גלגלי הצלה לכל נושא. בהצלחה!'
    }
});
