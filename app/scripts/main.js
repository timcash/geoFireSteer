(function() {
  var init, makeGfxPoint, makeTarget, makeVehicle, sim, start, step, targets, totaltime, truncate, updateVehicles, webgl;

  sim = {};

  webgl = null;

  start = null;

  totaltime = 0;

  targets = [];

  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  $(document).ready(function() {
    var container;
    container = $('#content')[0];
    Two.Resolution = 24;
    webgl = new Two({
      width: $(window).width(),
      height: $(window).height(),
      type: Two.Types.webgl
    }).appendTo(container);
    init();
    webgl.bind('update', function() {
      var v, vx, vy, _i, _len, _ref;
      _ref = sim.vehicles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.gfx.translation.x = v.pos.elements[0];
        v.gfx.translation.y = v.pos.elements[1];
        vx = v.vel.elements[0] * 30;
        vy = v.vel.elements[1] * 30;
        v.gfx.line.vertices[1].set(vx, vy);
      }
      return 0;
    }).play();
    requestAnimationFrame(step);
    return 0;
  });

  init = function() {
    var i, t, v, x, y, _i, _j, _results;
    sim.vehicles = [];
    sim.Ref = new Firebase('https://scoreboard3.firebaseio.com/geodata');
    sim.geoRef = new geoFire(sim.Ref);
    for (i = _i = 0; _i <= 4; i = ++_i) {
      x = Math.random() * $(window).width();
      y = Math.random() * $(window).height();
      t = makeTarget(x, y);
      targets.push(t);
    }
    _results = [];
    for (i = _j = 0; _j <= 10; i = ++_j) {
      v = makeVehicle(i);
      sim.vehicles.push(v);
      _results.push(sim.geoRef.insertByLocWithId([v.pos.elements[0] / 100, v.pos.elements[1] / 100], v.id, {
        id: v.id,
        maxVel: v.maxVel
      }));
    }
    return _results;
  };

  makeGfxPoint = function(x, y) {
    var c, group, l;
    c = webgl.makeCircle(0, 0, 10);
    c.fill = '#cccccc';
    c.noStroke();
    l = webgl.makeLine(0, 0, 0, 0);
    l.linewidth = 3;
    l.stroke = '#22ee22';
    group = webgl.makeGroup(c, l);
    group.line = l;
    group.domElement = webgl.renderer.domElement;
    return group;
  };

  makeTarget = function(x, y) {
    var c, group, t;
    c = webgl.makeCircle(x, y, 10);
    c.fill = '#FF8000';
    c.noStroke();
    group = webgl.makeGroup(c);
    group.domElement = webgl.renderer.domElement;
    t = {
      pos: Vector.create([x, y]),
      gfx: group
    };
    return t;
  };

  makeVehicle = function(i) {
    var v, vx, vy, x, y;
    x = Math.random() * $(window).width();
    y = Math.random() * $(window).width();
    vx = Math.random();
    vy = Math.random();
    v = {
      pos: Vector.create([x, y]),
      vel: Vector.create([0, 0]),
      acc: Vector.create([0, 0]),
      target: utils.randItem(targets).pos,
      hp: 0,
      gfx: makeGfxPoint(x, y),
      maxVel: (Math.random() + 1) * 20,
      maxForce: (1.0 / 60.0) * 10.0,
      mass: 40.0,
      maxSpeed: 10.0,
      id: i
    };
    return v;
  };

  truncate = function(vec, max) {
    var mag;
    mag = vec.modulus();
    if (mag > max) {
      return vec.x(max / mag);
    }
    return vec;
  };

  updateVehicles = function(dt) {
    var desired_vel, n, steering, t_p, v, _i, _len, _ref, _results;
    _ref = sim.vehicles;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      t_p = v.target.subtract(v.pos);
      n = t_p.toUnitVector();
      desired_vel = n.x(v.maxVel * dt);
      steering = desired_vel.subtract(v.vel);
      steering = truncate(steering, v.maxForce);
      steering = steering.x(1 / v.mass);
      v.vel = truncate(v.vel.add(steering), v.maxSpeed);
      _results.push(v.pos = v.pos.add(v.vel));
    }
    return _results;
  };

  step = function(timestamp) {
    var dt, loc, v, _i, _len, _ref;
    if (start === null) {
      start = timestamp;
    }
    dt = (timestamp - start) / 1000.0;
    start = timestamp;
    updateVehicles(dt);
    totaltime += dt;
    if (totaltime > 2) {
      _ref = sim.vehicles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        loc = [v.pos.elements[0] / 100, v.pos.elements[1] / 100];
        sim.geoRef.updateLocForId(loc, v.id);
        if (v.target.subtract(v.pos).modulus() < 10.0) {
          v.target = utils.randItem(targets).pos;
        }
      }
      totaltime = 0;
    }
    return requestAnimationFrame(step);
  };

}).call(this);

/*
//# sourceMappingURL=../../app/scripts/main.js.map
*/