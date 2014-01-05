
sim = {}
webgl = null
start = null
totaltime = 0
targets = []

window.requestAnimationFrame = window.requestAnimationFrame or window.mozRequestAnimationFrame or window.webkitRequestAnimationFrame or window.msRequestAnimationFrame

$( document ).ready( ()->

    container = $('#content')[0]

    Two.Resolution = 24

    webgl = new Two({
        width: $( window ).width(),
        height: $( window ).height(),
        type: Two.Types.webgl
    }).appendTo(container)

    init()

    webgl.bind('update', ()->

        for v in sim.vehicles
            v.gfx.translation.x = v.pos.elements[0]
            v.gfx.translation.y = v.pos.elements[1]
            vx = v.vel.elements[0] * 30
            vy = v.vel.elements[1] * 30

            v.gfx.line.vertices[1].set(vx,vy)
        return 0

    ).play()

    requestAnimationFrame(step)

    return 0
)

init = () ->
    sim.vehicles = []
    sim.Ref = new Firebase('https://scoreboard3.firebaseio.com/geodata')
    sim.geoRef = new geoFire(sim.Ref)

    for i in [0..4]
        x = Math.random() * $( window ).width()
        y = Math.random() * $( window ).height()
        t = makeTarget(x,y)
        targets.push(t)

    for i in [0..10]
        v = makeVehicle(i)
        sim.vehicles.push(v)
        sim.geoRef.insertByLocWithId([v.pos.elements[0]/100,v.pos.elements[1]/100],v.id,{id: v.id, maxVel: v.maxVel})

    # for v in sim.vehicles
    #     v.target = utils.randItem(sim.vehicles).pos



makeGfxPoint = (x,y)->
    c = webgl.makeCircle(0,0,10)
    c.fill = '#cccccc'
    c.noStroke()
    l = webgl.makeLine(0,0,0,0)
    l.linewidth = 3
    l.stroke = '#22ee22'
    group = webgl.makeGroup(c,l)
    group.line = l
    group.domElement = webgl.renderer.domElement
    return group

makeTarget = (x,y)->
    c = webgl.makeCircle(x,y,10)
    c.fill = '#FF8000'
    c.noStroke()
    group = webgl.makeGroup(c)
    group.domElement = webgl.renderer.domElement
    t =
        pos: Vector.create([x,y])
        gfx: group
    return t

makeVehicle = (i) ->
    x = Math.random() * $( window ).width()
    y = Math.random() * $( window ).width()

    vx = Math.random()
    vy = Math.random()

    v =
        pos: Vector.create([x,y])
        vel: Vector.create([0,0])
        acc: Vector.create([0,0])
        target: utils.randItem(targets).pos
        hp: 0
        gfx: makeGfxPoint(x,y)
        maxVel: (Math.random() + 1) * 20
        maxForce: (1.0/60.0) * 10.0
        mass: 40.0
        maxSpeed: 10.0
        id: i
    return v

truncate = (vec,max) ->
    mag = vec.modulus()
    if mag > max
        return vec.x(max/mag)
    return vec

updateVehicles = (dt) ->

    for v in sim.vehicles
        t_p = v.target.subtract(v.pos)
        n = t_p.toUnitVector()
        desired_vel = n.x(v.maxVel * dt)
        steering = desired_vel.subtract(v.vel)
        steering = truncate(steering, v.maxForce)
        steering = steering.x(1/v.mass)
        v.vel = truncate(v.vel.add(steering), v.maxSpeed)
        v.pos = v.pos.add(v.vel)


step = (timestamp) ->
    if start is null
        start = timestamp
    dt = (timestamp - start) / 1000.0
    start = timestamp
    updateVehicles(dt)
    totaltime += dt
    if totaltime > 2
        for v in sim.vehicles
            loc = [v.pos.elements[0]/100,v.pos.elements[1]/100]
            sim.geoRef.updateLocForId(loc, v.id)
            if v.target.subtract(v.pos).modulus() < 10.0
                v.target = utils.randItem(targets).pos
        # for v in sim.vehicles
        #     v.target = utils.randItem(sim.vehicles).pos


        totaltime = 0
    requestAnimationFrame(step)











