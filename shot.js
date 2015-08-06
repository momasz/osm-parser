var webshot = require('webshot');
var options = {
  windowSize: {
    width: 640,
    height: 480
  },
  phantomConfig: {
    'ssl-protocol': 'any',
    'ignore-ssl-errors': 'yes'
  }
};

webshot('https://www.google.pl/maps/place/Armii+Krajowej+28,+30-150+Krak%C3%B3w/@50.071783,19.890755,3a,75y,102.02h,90.85t/data=!3m7!1e1!3m5!1s5mOU3gB2dLmdOyyZSaZrIA!2e0!6s%2F%2Fgeo0.ggpht.com%2Fcbk%3Fcb_client%3Dmaps_sv.tactile%26output%3Dthumbnail%26thumb%3D2%26panoid%3D5mOU3gB2dLmdOyyZSaZrIA%26w%3D374%26h%3D75%26yaw%3D83%26pitch%3D0%26thumbfov%3D120%26ll%3D50.071783,19.890755!7i13312!8i6656!4m2!3m1!1s0x47165bc693cf009b:0x2f1799016f2da387!6m1!1e1', 'screenshots/jestwysoko.png', options, function(err) {

  // screenshot now saved to google.png
});