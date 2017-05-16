app.directive('header', function() {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'app/components/Header/Header.html',
        link: function(scope, elem, attrs) {
            var guide_link = document.querySelector('.btn-guide')

            guide_link.addEventListener('click', function() {
                ga_notify('links', 'guide', 'player clicked on guide link')
            })
        }
    };
});
