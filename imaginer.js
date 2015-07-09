var fs = require('fs');
var request = require('request');
var _ = require('underscore');
var jsonfile = require('jsonfile');

var source = __dirname + '/data/sample.json'; //'/data/sample.json';
var destination = __dirname + '/data/images.json'; //'/data/sample.json';

var obj = JSON.parse(fs.readFileSync(source, 'utf8'));
var streetApiUrl = 'https://maps.googleapis.com/maps/api/streetview?size=640x480&location={lat},{lng}&fov=50';

var results = {
  "results": []
};

for (var i = 0, len = obj.results.length; i < len; i++) {
  var raw = obj.results[i];
  var url = streetApiUrl.replace('{lat}', raw.latitude).replace('{lng}', raw.longitude);
  var imageName = raw.type + '_' + raw.latitude + '_' + raw.longitude + '.jpeg';

  raw.image = imageName;
  results.results.push(raw);

  var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

  download(url, __dirname + '/photos/' + imageName, function () {
    console.log('done');
  });
}

jsonfile.writeFile(destination, results, function (err) {
  console.error(err);
});