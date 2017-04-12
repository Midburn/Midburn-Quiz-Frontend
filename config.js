
var getConfigFromConfigFile = function(){
  var _config;
  $.ajax({
    url: 'config.json',
    success: function (data) {
      _config = data;
    },
    async: false,
    dataType: 'json'
  });

  return _config;
};