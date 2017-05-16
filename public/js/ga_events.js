function googleAnalyticsEvents() {
  // click on the guide link
  var guide_link = document.querySelector('.btn-guide')
  guide_link.addEventListener('click', function() {
    ga_notify('links', 'guide', 'player clicked on guide link')
  })
  // click on the full-screen button
  var fullscreen_btn = document.querySelector('#goFS')
  fullscreen_btn.addEventListener('click', function() {
    ga_notify('buttons', 'fullscreen', 'player wants fullscreen')
  })
}
