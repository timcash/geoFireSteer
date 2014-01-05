(function() {
  var makeEye, makePoints, points, webgl;

  console.log('\'Allo \'Allo!');

  points = [];

  webgl = null;

  $(document).ready(function() {
    var container, eyes;
    container = $('#content')[0];
    Two.Resolution = 24;
    webgl = new Two({
      width: 400,
      height: 400,
      type: Two.Types.webgl
    }).appendTo(container);
    eyes = [makeEye(webgl)];
    eyes[0].domElement = webgl.renderer.domElement;
    webgl.bind('update', function() {
      var eye, t;
      eye = eyes[0];
      if (eye.scale > 0.9999) {
        eye.scale = eye.rotation = 0;
      }
      t = (1 - eye.scale) * 0.125;
      eye.scale += t;
      eye.rotation += t * 4 * Math.PI;
      return 0;
    }).play();
    return 0;
  });

  makeEye = function(two) {
    var c, group;
    c = two.makeCircle(72, 100, 50);
    group = two.makeGroup(c);
    return group;
  };

  makePoints = function() {
    return 0;
  };

}).call(this);

/*
//# sourceMappingURL=../../app/scripts/main.js.map
*/