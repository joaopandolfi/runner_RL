var Player = {
    score:0,
    road:1,
    position:0,
    end_x: 0,
    reference:null,
    danger_zone_size:100,
    brain:null,
    last_readed_sensor: null
}

// up -> 22px
// Mid -> 160px
// Down -> 295px
var _player_road_1 = 22
var _player_road_2 = 155
var _player_road_3 = 295

function newPlayer() {
    let p = Object.assign({},Player)
    player_obj = document.getElementById("player")
    player_pos = player_obj.getBoundingClientRect()
    p.position = (player_pos.right - p.danger_zone_size)
    p.reference = player_obj
    p.end_x = player_pos.x
    p.brain = newBrain()
    return p
}

function moveUp(player) {
    if (player.road == 2) {
        player.reference.style.marginTop = _player_road_1
        player.road = 1
    }else if (player.road == 3) {
        player.reference.style.marginTop = _player_road_2
        player.road = 2
    }
}

function moveDown(player) {
    if (player.road == 2) {
        player.reference.style.marginTop = _player_road_3
        player.road = 3
    }else if (player.road == 1) {
        player.reference.style.marginTop = _player_road_2
        player.road = 2
    }
}

function addScore(player,score) {
    player.score += score
}