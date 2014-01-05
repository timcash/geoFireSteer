
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

            vx = v.vel.elements[0] * 20
            vy = v.vel.elements[1] * 20

            v.gfx.line.vertices[1].set(vx,vy)

            sx = v.steer.elements[0] * 20
            sy = v.steer.elements[1] * 20
            v.gfx.steer.vertices[1].set(sx,sy)
        return 0

    ).play()

    requestAnimationFrame(step)

    return 0
)

init = () ->
    sim.vehicles = []
    sim.Ref = new Firebase('https://scoreboard3.firebaseio.com/geodata')
    sim.geoRef = new geoFire(sim.Ref)

    for i in [0..1]
        x = 50 + ( Math.random() * ( $( window ).width() - 50 ))
        y = 50 + ( Math.random() * ( $( window ).height() - 50 ))
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

    st = webgl.makeLine(0,0,0,0)
    st.linewidth = 3
    st.stroke = '#2222ee'


    group = webgl.makeGroup(c,l,st)
    group.line = l
    group.steer = st
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
        vel: Vector.create([10.0,10.0])
        acc: Vector.create([0.0,0.0])
        steer: Vector.create([0.0,0.0])
        target: utils.randItem(targets).pos
        hp: 0
        gfx: makeGfxPoint(x,y)
        maxVel: 1.5
        maxForce: 0.2
        mass: 20.0
        maxSpeed: 1.0
        id: i

    v.vel = truncate(v.vel, v.maxVel)
    return v

truncate = (vec,max) ->
    i = max / vec.modulus()
    if i < 1.0
        i = 1.0

    return vec.x(i)

updateVehicles = (dt) ->

    for v in sim.vehicles
        steer = seek(v)
        steer = truncate(steer,v.maxForce)
        v.steer = steer
        steer = steer.x(1.0/v.mass)
        v.vel = v.vel.add(steer)
        v.vel = truncate(v.vel, v.maxVel)
        v.pos = v.pos.add(v.vel)


seek = (v) ->
    des = v.target.subtract(v.pos)
    des = des.toUnitVector()
    des = des.x(v.maxVel)
    force = des.subtract(v.vel)
    return force


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











