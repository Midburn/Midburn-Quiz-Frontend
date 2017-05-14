function googleAnalyticsEvents() {
  // click on the guide link
  var guide_link = document.querySelector('#linkto_guide')
  guide_link.addEventListener('click', function() {
    ga_notify('links', 'guide', 'player clicked on guide link')
  })
}
