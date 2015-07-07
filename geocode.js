var fs = require('fs');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var Q = require('q');
var express = require('express');
var app = express();
var jsonfile = require('jsonfile');

var API_KEY = 'AIzaSyA608ikt3pC3clvAXXgKSCdB0bJJizNRHU';

// API KEYS
// --------------------------------------------------
// momasz:      AIzaSyBnUliMFphgKMXDmZkcZxTn4iFCnD0SKEo //$
// robson:      AIzaSyDqjUSdZNgk4abmD8Ewwi943FcAwl8bW-s //$
// jano:        AIzaSyAvtrYT-UXebfua3yqT66Zu0QY-BeHv38U //$
// maciek:      AIzaSyCm0JgjKN_-kSRlLdU7XJk35RTlA2GPEt0 //$
// romanek.dev  AIzaSyDDL0zZ3vJdQEQ_O3f7iIV9damIY_bhEvo //$
// mirek:       AIzaSyCiZowmkEHa6gRirtKlVyLNP_a9Yh0M2Bc //$
// mefior:      AIzaSyA5_w7elie-6aAXbiw2_gXvHDUCXDoeE8k //$
// wln:         AIzaSyDgHfunnAhnFEXYRze3OlCX5jYxdzeo9eY //$
// ren:         AIzaSyDUsN9S5C0r3-PiEx6FPFiVC4KZvGwZeh8 //$
// pablo:       AIzaSyDcjxKBnc6aJFp8G9wZCp_uhbtvxIuQyag //$
// michal:      AIzaSyAAYvDaIfLFY0KJrnRCYT4JWb0BwmJG5jU //$
// ano:         AIzaSyA608ikt3pC3clvAXXgKSCdB0bJJizNRHU
// maniek:      AIzaSyBnz4Sj4E0s8fStyP8OUnMmThPIvM9RHB4 //$
// --------------------------------------------------

var source = __dirname + '/data/england_-6.645_49.941_07395779.json'; //'/data/sample.json';

var obj = JSON.parse(fs.readFileSync(source, 'utf8'));
var geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key=' + API_KEY + '&language=en-gb';
var requests = [];
var results = [];
var index = parseInt(process.argv[2]) || 23574;
var maxIteration = 2500;
var max = index + maxIteration;
var defects = [];

var destination = __dirname + '/data/geocode_' + index + '_' + max + '.json';
var errorFile = __dirname + '/data/defects_' + index + '_' + max + '.json';

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

    if (params.status === 'OVER_QUERY_LIMIT') {
      console.log('over query limit at index: ', index);
      return next('error');
    }

    index++;

    function handleDefect () {
      console.log('defect');

      results.push(raw);

      defects.push({
        index: index,
        name: raw.name
      });

      return next();
    }

    if (!params.results[0]) {
      return handleDefect();
    }

    var addr = params.results[0];

    if (typeof addr['address_components'] !== 'undefined') {
      var components = addr['address_components'];
    } else {
      return handleDefect();
    }

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
    jsonfile.writeFile(errorFile, defects, function (err) {
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