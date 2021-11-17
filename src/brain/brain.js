var Brain = {
    memory:{}
}

var _patience = 100

var DecisionUp = "up"
var DecisionStop = "stop"
var DecisionDown = "down"

var Signal = {
    up: -1* _patience,
    stop:-1* _patience,
    down: -1* _patience
}

function newBrain() {
    let b = Object.assign({},Brain)

    return b
}

function learn(brain,signal,decision,score) {
    if (!brain.memory[signal]) { 
        brain.memory[signal] = Object.assign({},Signal)
    }
    brain.memory[signal][decision] += score
}

function randomDecision(){
    let pos = {1:DecisionUp,2:DecisionStop,3:DecisionDown}
    let rand = Math.round(Math.random() * (4 - 1) + 1) 
    rand = rand >3? 3: rand;
    return pos[rand]
}

function takeDecision(brain, signal) {
    if (!brain.memory[signal]){
        brain.memory[signal] = Object.assign({},Signal)
    }

    let mem = brain.memory[signal]

    if (mem.up == mem.down && mem.up == mem.stop) {
        return randomDecision()
    }

    if (mem.up >= (mem.stop - _patience) && mem.up >= (mem.down- _patience)){
        return DecisionUp
    }

    if (mem.down >= (mem.up- _patience) && mem.down <= (mem.stop- _patience)){
        return DecisionStop
    }

    if (mem.down - _patience < 0 ) {
        return randomDecision()
    }

    return DecisionDown
}