var fs = require('fs');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var Q = require('q');
var express = require('express');
var app = express();
var jsonfile = require('jsonfile');

var API_KEY = 'AIzaSyBnUliMFphgKMXDmZkcZxTn4iFCnD0SKEo';

var source = __dirname + '/data/england_-6.645_49.941_07395779.json';

var obj = JSON.parse(fs.readFileSync(source, 'utf8'));
var geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key=' + API_KEY + '&language=en-gb';
var requests = [];
var results = [];
var index = parseInt(process.argv[2]) || 0;
var maxIteration = 10;
var max = index + maxIteration;

var destination = __dirname + '/data/geocode_' + index + '_' + max + '.json';

function makeCall (next) {
  var deffered = Q.defer();

  if (index >= max) {
    return next('error');
  }

  var raw = obj[index] || null;

  if (!raw) {
    return next('error');
  }

  var url = geocodeUrl.replace('{lat}', raw.latitude).replace('{lng}', raw.longitude);

  request(url, function (error, response, body) {
    console.log(index);

    var params = JSON.parse(body);

    if (error || response.statusCode !== 200) {
      return next('error');
    }

    index++;

    if (!params.results[0]) {
      next();
    }

    var addr = params.results[0];
    var components = addr['address_components'];

    function findKey(key) {
      return _.find(components, function (num) {
        return key === num.types[0];
      });
    }

    function getName (item) {
      return item ? item['long_name'] : null;
    }

    raw.address = addr['formatted_address'];
    raw.city = getName(findKey('postal_town'));
    raw.street = getName(findKey('route'));
    raw.houseNumber = getName(findKey('street_number'));
    raw.postCode = getName(findKey('postal_code'));
    raw.country = getName(findKey('country'));

    results.push(raw);

    return next();
  });

  return deffered.promise;
}

for (var i = 0, len = maxIteration; i < len; i++) {
  requests.push(makeCall);
}

app.get('/', function (req, res) {
  async.forever(makeCall, function (result) {
    jsonfile.writeFile(destination, results, function (err) {
      console.error(err);
    });
    res.json(results);
  });
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});