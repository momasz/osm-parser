var jsonfile = require('jsonfile');
var file = __dirname + '/data/images_london.json';
var resultFile = __dirname + '/data/london_districts.json';
var result = {
  "results": []
};

/*
 putney: SW15
 balham: SW12
 clapham: SW4
 shoreditch: N1
 fulham: SW6
 */
var districtCodes = ['SW15 ', 'SW12 ', 'SW4 ', 'N1 ', 'SW6 ', 'SW15,', 'SW12,', 'SW4,', 'N1,', 'SW6,'];

function matchDistrict(element) {
  return districtCodes.some(function (code) {
    var regexp = new RegExp(code, 'gi');
    return element.postCode && regexp.test(element.postCode) ||
      element.address && regexp.test(element.address);
  });
}

jsonfile.readFile(file, function (err, obj) {
  var objects = obj.results;
  for (var i = 0, len = objects.length; i < len; i++) {
    var item = objects[i];

    if (item.address && item.city === "London" && matchDistrict(item)) {
      result.results.push(item);
    }
  }

  jsonfile.writeFile(resultFile, result, function (err, obj) {

  });
});