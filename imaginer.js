var fs = require('fs');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var jsonfile = require('jsonfile');
var Q = require('q');

var source = __dirname + '/data/parsed.json'; //'/data/sample.json';
var destination = __dirname + '/data/images.json'; //'/data/sample.json';

var obj = JSON.parse(fs.readFileSync(source, 'utf8'));
var streetApiUrl = 'https://maps.googleapis.com/maps/api/streetview?size=640x480&location={lat},{lng}&fov=50';

var requests = [];
var results = {
  "results": []
};
var index = 0;

function makeCall (next) {
  var deffered = Q.defer();

  var raw = obj.results[index];

  var url = streetApiUrl.replace('{lat}', raw.geoPoint.latitude).replace('{lng}', raw.geoPoint.longitude);
  var imageName = raw.type + '_' + raw.geoPoint.latitude + '_' + raw.geoPoint.longitude + '.jpeg';
  console.log(imageName);

  raw.image = imageName;
  results.results.push(raw);

  index++;

  var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
      if (err) {
        return next('error');
      }

      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

  download(url, __dirname + '/photos/' + imageName, function () {
    console.log('done');
    return next();
  });

  return deffered.promise;
}

for (var i = 0, len = obj.results.length; i < len; i++) {
  console.log(i, ':', index);
  requests.push(makeCall);
}

async.forever(makeCall, function () {
  jsonfile.writeFile(destination, results, function (err) {
    console.error(err);
  });
});