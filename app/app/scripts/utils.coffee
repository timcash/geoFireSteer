pi = Math.PI
rpc = 2*pi

class Utils
  constructor:()->
    @gid = 0

  randInt:(bot,top) ->
   diff = top+1-bot
   return Math.floor(Math.random()*diff)+bot

  randItem:(items)->
    i = @randInt(0,items.length-1)
    return items[i]

  fslog:(text)->
    try
      console.log(text)
    catch err
      return null

  distance:(x1,y1,x2,y2)->
    dx = x2-x1
    dy = y2-y1
    return Math.sqrt(dx*dx + dy*dy)

  time2radian:(start,length)->
    now = @time()
    sdiff = (now - start) * 1.0
    percentDone = sdiff/length
    percentRadians = percentDone * rpc
    return percentRadians

  time:()->
    return new Date().getTime()

  rad:(deg)->
    return deg * (pi/180)

  deg:(rad)->
    return rad * (180/pi)

  id:()->
    @gid += 1
    return @gid

if window?
  window.utils = new Utils()

