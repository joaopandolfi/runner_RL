var player = null

var obstacles = []
var golds = []
var roads = {}

var _roads = {
    "1": [],
    "2":[],
    "3":[]
}

var _clock_time_ms = 100
var _interactions_patience = 15
var _interactions = 0
var _delta_distance = 10
var _active = false
var _loop = null

function initialize(){
    if (_active){
        if (_loop == null )
        _loop= setInterval(tick,_clock_time_ms)
        return
    } 
    resetRoads()
    cleanObstacles()
    player =  newPlayer()
    
    generateNewObj()
    
    _active = true
    _loop= setInterval(tick,_clock_time_ms)
}


function stop(){
    clearInterval(_loop)
    _loop =null
}

function reset() {
    _active = false
}

function cleanObstacles() {
    obstacles.map(o=>o.Delete(o))
    obstacles = []
    golds.map(o=>o.Delete(o))
    golds = []
}

function resetRoads(){
    roads = Object.assign({},_roads)
}

function generateNewObj(){
    let obj = newRandomObstacle()

    if (obj.type == GoldType){
        golds.push(obj)
    }else {
        obstacles.push(obj)
    }

    roads[obj.road].push(obj)
}

function printStatus(decision,interaction, score) {
    let raw = document.getElementById("raw")
    raw.innerText = JSON.stringify(player.brain)
    document.getElementById("decision").innerText = decision
    document.getElementById("interaction").innerText = interaction
    document.getElementById("score").innerText = score
}

function tick() {

    for (let i=1;i<=3; i++){
        let last = _roads[i].pop()
        if (last){
            last.Move(last,_delta_distance)
            _roads[i].push(last)
        }
    }    

    let sensor = readSensors(player,obstacles,golds)
    let signal = sensor.ToSignal(sensor)
    let decision = takeDecision(player.brain,signal)

    switch (decision) {
        case DecisionUp:
            moveUp(player)
            break;
        case DecisionDown:
            moveDown(player)    
            break
    }

    sensor_after_move = readSensors(player,obstacles,golds)
    
    let reward = BeAliveReward

    if (sensor_after_move.caugh_gold){
        reward = GoldReward
    } else if (sensor_after_move.colision){
        reward = ObstacleReward
    }

    learn(player.brain,signal,decision, reward)
    addScore(player,reward)

    _interactions+=1

    if (_interactions % _interactions_patience == 0){
        generateNewObj()
    }

    printStatus(decision,_interactions,player.score)
}