(function() {
  var Utils, pi, rpc;

  pi = Math.PI;

  rpc = 2 * pi;

  Utils = (function() {
    function Utils() {
      this.gid = 0;
    }

    Utils.prototype.randInt = function(bot, top) {
      var diff;
      diff = top + 1 - bot;
      return Math.floor(Math.random() * diff) + bot;
    };

    Utils.prototype.randItem = function(items) {
      var i;
      i = this.randInt(0, items.length - 1);
      return items[i];
    };

    Utils.prototype.fslog = function(text) {
      var err;
      try {
        return console.log(text);
      } catch (_error) {
        err = _error;
        return null;
      }
    };

    Utils.prototype.distance = function(x1, y1, x2, y2) {
      var dx, dy;
      dx = x2 - x1;
      dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    };

    Utils.prototype.time2radian = function(start, length) {
      var now, percentDone, percentRadians, sdiff;
      now = this.time();
      sdiff = (now - start) * 1.0;
      percentDone = sdiff / length;
      percentRadians = percentDone * rpc;
      return percentRadians;
    };

    Utils.prototype.time = function() {
      return new Date().getTime();
    };

    Utils.prototype.rad = function(deg) {
      return deg * (pi / 180);
    };

    Utils.prototype.deg = function(rad) {
      return rad * (180 / pi);
    };

    Utils.prototype.id = function() {
      this.gid += 1;
      return this.gid;
    };

    return Utils;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.utils = new Utils();
  }

}).call(this);

/*
//# sourceMappingURL=../../app/scripts/utils.js.map
*/