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
    DESC: 'ברוכים הבאים למשחק הטריוויה החדש שמשגע את הפלאייה! רוצים כרטיסים? אתם חייבים לעבור אותו! איך מנצחים? עליכם לעבור 5 נושאים שקשורים למידברן, ובכל נושא לענות נכון על ' + gameVariables.numOfcurrectAnswerInStreak.toString() + ' שאלות רצופות. לרשותכם שני גלגלי הצלה לכל נושא. בהצלחה!',
    INFO: 'רגע, מה זה מידברן?'
  };
  // English conf
  $translateProvider.translations('en', dic_EN);
  // Hebrew conf
  $translateProvider.translations('he', dic_HE);
  // Default language
  $translateProvider.preferredLanguage('he');
});
