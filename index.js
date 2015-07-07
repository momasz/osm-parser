var fs = require('fs');
var OSMStream = require('node-osm-stream');
var JSONStream = require('JSONStream');
var EOL = require('os').EOL;

var source = __dirname + '/data/planet_-6.645_49.941_07395779.osm';
var destination = __dirname + '/data/sample_geocode.json';

var readstream = fs.createReadStream(source);
var parser = OSMStream();
var writestream = fs.createWriteStream(destination);
var jsonParser;

var index = 0;

readstream
  .pipe(parser)
  .pipe(writestream);

readstream.on('open', function () {
  console.log('Opened .osm file:', source, '\n');
});

var firstLine = true;
parser.on('writeable', function (data, callback) {
  if (firstLine) {
    firstLine = false;
    callback('[' + EOL + '  ' + JSON.stringify(data));
  } else {
    callback(',' + EOL + '  ' + JSON.stringify(data));
  }
});

parser.on('flush', function (callback) {
  callback(EOL + ']' + EOL);
});

parser.on('node', function (node, callback) {
  var tags = node.tags;
  var amenity = tags['amenity'];

  if (amenity === 'bar'
    || amenity === 'pub'
    || amenity === 'gastropub') {

    var raw = {
      name: tags['name'] || null,
      address: tags['addr:city'] || null,
      city: tags['addr:city'] || null,
      street: tags['addr:street'] || null,
      houseNumber: tags['addr:housenumber'] || null,
      postCode: tags['addr:postcode'] || null,
      latitude: node.lat || null,
      longitude: node.lon || null,
      phoneNumber: tags['phone'] || null,
      contactName: null,
      type: tags['amenity'] || null,
      photos: null,
      openingTimes: tags['opening_hours'] || null,
      description: tags['description'] || null,
      amenities: tags['amenities'] || null,
      logo: tags['logo'] || null,
      toilets: tags['toilets'] || null,
      website: tags['website'] || null,
      wifi: tags['wifi'] || null,
      wheelchair: tags['wheelchair'] || null
    };

    callback(raw);
  } else {
    callback();
  }
});

parser.on('way', function (way, callback) {
  callback();
});

parser.on('relation', function (relation, callback) {
  callback();
});

parser.on('end', function () {
  console.log('Finished parsing our .osm file');
  console.log('Bytes read from incoming stream:', parser.bytesRead, 'bytes');
  console.log('Bytes written to outgoing stream:', parser.bytesWritten, 'bytes\n');
  console.log('Checking that written file is a valid JSON:', destination);

  jsonParser = JSONStream.parse(['rows', true]);
  fs.createReadStream(destination).pipe(jsonParser);

  var isValidJSON = true;

  jsonParser.on('error', function (err) {
    console.log('JSON error', err);
    isValidJSON = false;
  });
  jsonParser.on('close', function () {
    console.log('JSON file check:', (isValidJSON) ? 'OK' : 'ERROR');
    console.log();
  });
});