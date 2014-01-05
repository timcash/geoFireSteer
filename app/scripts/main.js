(function() {
  var init, makeGfxPoint, makeTarget, makeVehicle, seek, sim, start, step, targets, totaltime, truncate, updateVehicles, webgl;

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
      var sx, sy, v, vx, vy, _i, _len, _ref;
      _ref = sim.vehicles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.gfx.translation.x = v.pos.elements[0];
        v.gfx.translation.y = v.pos.elements[1];
        vx = v.vel.elements[0] * 20;
        vy = v.vel.elements[1] * 20;
        v.gfx.line.vertices[1].set(vx, vy);
        sx = v.steer.elements[0] * 20;
        sy = v.steer.elements[1] * 20;
        v.gfx.steer.vertices[1].set(sx, sy);
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
    for (i = _i = 0; _i <= 1; i = ++_i) {
      x = 50 + (Math.random() * ($(window).width() - 50));
      y = 50 + (Math.random() * ($(window).height() - 50));
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
    var c, group, l, st;
    c = webgl.makeCircle(0, 0, 10);
    c.fill = '#cccccc';
    c.noStroke();
    l = webgl.makeLine(0, 0, 0, 0);
    l.linewidth = 3;
    l.stroke = '#22ee22';
    st = webgl.makeLine(0, 0, 0, 0);
    st.linewidth = 3;
    st.stroke = '#2222ee';
    group = webgl.makeGroup(c, l, st);
    group.line = l;
    group.steer = st;
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
      vel: Vector.create([10.0, 10.0]),
      acc: Vector.create([0.0, 0.0]),
      steer: Vector.create([0.0, 0.0]),
      target: utils.randItem(targets).pos,
      hp: 0,
      gfx: makeGfxPoint(x, y),
      maxVel: 1.5,
      maxForce: 0.2,
      mass: 20.0,
      maxSpeed: 1.0,
      id: i
    };
    v.vel = truncate(v.vel, v.maxVel);
    return v;
  };

  truncate = function(vec, max) {
    var i;
    i = max / vec.modulus();
    if (i < 1.0) {
      i = 1.0;
    }
    return vec.x(i);
  };

  updateVehicles = function(dt) {
    var steer, v, _i, _len, _ref, _results;
    _ref = sim.vehicles;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      v = _ref[_i];
      steer = seek(v);
      steer = truncate(steer, v.maxForce);
      v.steer = steer;
      steer = steer.x(1.0 / v.mass);
      v.vel = v.vel.add(steer);
      v.vel = truncate(v.vel, v.maxVel);
      _results.push(v.pos = v.pos.add(v.vel));
    }
    return _results;
  };

  seek = function(v) {
    var des, force;
    des = v.target.subtract(v.pos);
    des = des.toUnitVector();
    des = des.x(v.maxVel);
    force = des.subtract(v.vel);
    return force;
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