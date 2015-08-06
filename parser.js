var jsonfile = require('jsonfile');
var file = __dirname + '/data/images.json';
var resultFile = __dirname + '/data/addressed.json';
var result = {
  "results": []
};

jsonfile.readFile(file, function(err, obj) {
  var objects = obj.results;
  for (var i = 0, len = objects.length; i < len; i++) {
    var item = objects[i];
    if (item.address) {
      result.results.push(item);
    }
  }

  jsonfile.writeFile(resultFile, result, function (err, obj) {

  });
});