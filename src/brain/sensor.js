var Sensor = {
    
    caugh_gold:0,
    close_to_gold:0,
    gold_in_left:0,
    gold_in_font:0,
    gold_in_right:0,

    colision:0,
    in_danger:0,
    obstacle_in_left:0,
    obstacle_in_right:0,
    close_to_obstacle:0,
    road:1
}

Sensor.ToSignal = (s) => {
    return `${s.road};${s.close_to_gold};${s.gold_in_left};${s.gold_in_font};${s.gold_in_right};${s.in_danger};${s.obstacle_in_left};${s.obstacle_in_right};${s.close_to_obstacle};`
}

function readSensors(player,obstacles, golds) {
    let caugh_in_sensor = Object.assign({},Sensor)
    if (obstacles != null && obstacles.length) {
        obstacles.map(o => {
            o.CalcPosition(o)
            if (player.road == o.road){
                if (o.HasColided(player,o)){
                    caugh_in_sensor.colision = 1
                    o.reference.remove()
                }
    
                if (o.AreInDangerZone(player,o)){
                    caugh_in_sensor.in_danger = 1
                }
                
                if (o.Nearby(player,o)){
                    caugh_in_sensor.close_to_obstacle = 1
                }
            }
            
            if (player.road < o.road && o.AreInDangerZone(player,o)) {
                caugh_in_sensor.obstacle_in_left = 1
            }
            
            if (player.road > o.road && o.AreInDangerZone(player,o)) {
                    caugh_in_sensor.obstacle_in_right = 1
            }
            
            return !o.AutoDestroy(player,o)
        })
    }

    if (golds != null && golds.length) {
        golds.map(o => {
            o.CalcPosition(o)
            if (player.road == o.road){
                if (o.HasColided(player,o)){
                    caugh_in_sensor.caugh_gold = 1
                    o.reference.remove()
                }
    
                if (o.AreInDangerZone(player,o)){
                    caugh_in_sensor.close_to_gold = 1
                }
                
                if (o.Nearby(player,o)){
                    caugh_in_sensor.gold_in_font = 1
                }
            }
            
            if (player.road < o.road && o.Nearby(player,o)) {
                caugh_in_sensor.gold_in_left = 1
            }
            
            if (player.road > o.road && o.Nearby(player,o)) {
                    caugh_in_sensor.gold_in_right = 1
            }
            return !o.AutoDestroy(player,o)
        })
    }

    caugh_in_sensor.road = player.road
    return caugh_in_sensor
}