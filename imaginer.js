var fs = require('fs');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var jsonfile = require('jsonfile');
var Q = require('q');
var path = require('path');


var source = __dirname + '/data/london.json'; //'/data/sample.json';
var destination = __dirname + '/data/images_london.json'; //'/data/sample.json';

var API_KEY = process.env.API_KEY;

var obj = JSON.parse(fs.readFileSync(source, 'utf8'));
var streetApiUrl = 'https://maps.googleapis.com/maps/api/streetview?size=640x480&location={lat},{lng}&fov=120&key=' + API_KEY;
var streetApiUrWithAddress = 'https://maps.googleapis.com/maps/api/streetview?size=640x480&location={address}&key=' + API_KEY;

var requests = [];
var results = {
  "results": []
};
var index = 0;

function makeCall (next) {
  var deffered = Q.defer();

  var raw = obj.results[index];

  if (!raw) {
    return next('error');
  }

  //var url = streetApiUrl.replace('{lat}', raw.geoPoint.latitude).replace('{lng}', raw.geoPoint.longitude);
  var url = streetApiUrWithAddress.replace('{address}', raw.name + ', ' + raw.address);
  var imageName = raw.type + '_' + raw.geoPoint.latitude + '_' + raw.geoPoint.longitude + '.jpeg';

  raw.image = imageName;
  results.results.push(raw);

  index++;

  var check = function(uri, filename, callback) {
    fs.stat(filename, function (err, stat) {
      if (err == null) {
        return next();
      } else if (err.code == 'ENOENT') {
        console.log('file doesnt exist');
        download(uri, filename, callback);
      } else {
        console.log('Some other error: ', err.code);
      }
    });
  };

  var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
      if (err) {
        console.error('error at index :: ', index);
        return next('error');
      }

      console.log(raw.name + ', ' + raw.address);

      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

  check(url, __dirname + '/photos_120/' + imageName, function () {
    console.log('done');
    return next();
  });

  return deffered.promise;
}

for (var i = 0, len = obj.results.length; i < len; i++) {
  //console.log(i, ':', index);
  requests.push(makeCall);
}

async.forever(makeCall, function () {
  var unique = _.uniq(results.results, function(item, key, geoPoint) {
    return item.image;
  });

  jsonfile.writeFile(destination, { results: unique }, function (err) {
    console.error(err);
  });
});
