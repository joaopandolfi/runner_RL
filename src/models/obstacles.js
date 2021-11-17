var GoldReward = 1000
var ObstacleReward = -1000
var BeAliveReward = 1

var ObstacleType ="obstacle"
var GoldType = "gold"

var obstacle = {
    road:0,
    reward:0,
    distance:100,
    position_x:0,
    reference: null,
    type: "",
}

obstacle.CalcPosition = (obj) => {
    rect = obj.reference.getBoundingClientRect()
    obj.position_x = rect.x
}

obstacle.HasColided = (player, obj) =>{
    return (obj.position_x <= player.position)
}

obstacle.AreInDangerZone = (player, obj) => {
    return (obj.position_x <= (player.position+ player.danger_zone_size))
} 

obstacle.Nearby = (player, obj) => {
    return (obj.position_x <= (player.position+ (player.danger_zone_size*5)))
}

obstacle.Move = (obj,distance) => {
    let current = parseInt(obj.reference.style.marginRight)
    if (!current) current = 0
    obj.reference.style.marginRight = current+distance
}

obstacle.AutoDestroy = (player, obj) => {
    if (obj.position_x <= (player.end_x +10)) {
        obj.Delete(obj)
        return true
    }
    return false
}

obstacle.Delete = (obj) => {
    obj.reference.remove()
}

function random(min,max) {
    let rand = Math.round(Math.random() * ((max+1) - min) + min) 
    return rand >max? max: rand;
}

function newRandomObstacle(){
    let road = random(1,3)
    let type = random(1,5)
    if (type <= 3) {
        return newObstacle(road,ObstacleType,ObstacleReward)
    }
    
    return newObstacle(road,GoldType,GoldReward)
}

function newObstacle(road,type, reward){
    let obj = Object.assign({},obstacle)
    obj.reference = document.createElement("div")
    obj.reference.className = type
    obj.road = road
    obj.reward = reward
    obj.type = type
    road = document.getElementById(`road${road}`)
    //road.appendChild(obj.reference)
    if (road.firstChild)
        road.insertBefore( obj.reference,road.firstChild)
    else road.appendChild(obj.reference)
    return obj
}
