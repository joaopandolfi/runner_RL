var fs = require("fs")
const { exit } = require("process")
var Brain = {
    memory:{}
}

var _patience = 500

var DecisionLeft = 0
var DecisionFront = 1
var DecisionRight = 2

var Signal = {
    0: -1* _patience,
    1:-1* _patience,
    2: -1* _patience
}

var rotateMatrix = {
    "N":["W","N","E"],
    "E":["N","E","S"],
    "S":["E","S","W"],
    "W":["S","W","N"]
}


Brain.newBrain = ()=> {
    let b = Object.assign({},Brain)

    return b
}

Brain.saveState = (brain) =>{
    //console.log("Saving State")
    data = JSON.stringify(brain)
    fs.writeFile('stateDump.json', data, (a)=>{}); 
}

Brain.saveBestState = (brain,score) =>{
    //console.log("Saving State")
    data = JSON.stringify(brain)
    fs.writeFile(`bestStateDump_${score}.json`, data, (a)=>{}); 
}


Brain.load = async (callback) => {
    Brain.loadSavedState((s,brain)=>{callback(brain)})
}

Brain.loadSavedState = async (callback) =>{
    console.log("LOADING SAVED State")
    await fs.readFile('stateDump.json', (err, data) =>{
        if (err){
            console.log(err);
            callback(false,Brain.newBrain())
        } else {
            obj = JSON.parse(data); 
            callback(true,obj)
    }})
}


Brain.learn = (brain,signal,direction,decision,score) => {
    signal = `${signal}${direction};`
    if (!brain.memory[signal]) { 
        brain.memory[signal] = Object.assign({},Signal)
    }
    let pos = rotateMatrix[direction].indexOf(decision)
    brain.memory[signal][pos] += score
}

function randomDecision(){
    let pos = {1:DecisionLeft,2:DecisionFront,3:DecisionRight}
    let rand = Math.round(Math.random() * (4 - 1) + 1) 
    rand = rand >3? 3: rand;
    return pos[rand]
}


Brain.takeDecision = (brain, signal,direction) =>{
    signal = `${signal}${direction};`
    if (!brain.memory[signal]){
        brain.memory[signal] = Object.assign({},Signal)
    }

    let mem = brain.memory[signal]

    let rotation = rotateMatrix[direction]

    if (Math.random() <= 0.01)return rotation[randomDecision()]
    
    if (mem[DecisionLeft] == mem[DecisionRight] && mem[DecisionLeft] == mem[DecisionFront]) {
        return rotation[randomDecision()]
    }

    if (mem[DecisionLeft] >= (mem[DecisionFront] - _patience) && mem[DecisionLeft] >= (mem[DecisionRight]- _patience)){
        return rotation[DecisionLeft]
    }

    if (mem[DecisionFront] >= (mem[DecisionLeft]- _patience) && mem[DecisionFront] >= (mem[DecisionRight]- _patience)){
        return rotation[DecisionFront]
    }

    if (mem[DecisionRight] - _patience < 0 ) {
        return rotation[randomDecision()]
    }

    return rotation[DecisionRight]
}


module.exports = Brain