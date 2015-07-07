var fs = require('fs');
var async = require('async');
var jsonfile = require('jsonfile');
var glob = require('glob');

var result = {
  "results": []
};
var destination = __dirname + '/data/result.json';

glob(__dirname + '/data/geocode*', {}, function (er, files) {
  async.eachSeries(
    files,
    function(filename, cb) {
      fs.readFile(filename, function(err, content) {
        if (err) {
          return;
        }

        var data = JSON.parse(content);

        result['results'] = result['results'].concat(parseElements(data));

        // Calling cb makes it go to the next item.
        cb(err);
      });
    },
    // Final callback after each item has been iterated over.
    function(err, content) {
      jsonfile.writeFile(destination, result, function (err) {
        console.error(err);
      });
    }
  );
});

function parseElements (data) {
  var parsed = [];

  for (var i = 0, len = data.length; i < len; i++) {
    var element = data[i];
    var parsedElement = {
      "name": element.name,
      "address": element.address,
      "street": element.street,
      "houseNumber": element.houseNumber,
      "postCode": element.postCode,
      "geoPoint": {
        "latitude": element.latitude,
        "longitude": element.longitude
      },
      "phoneNumber": element.phoneNumber,
      "contactName": element.contactName,
      "type": element.type,
      "photos": [],
      "openingTimes": element.openingTimes,
      "description": element.description,
      "amenities": [],
      "logo": element.logo
    };

    parsed.push(parsedElement);
  }

  return parsed;
}