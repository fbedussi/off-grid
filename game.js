const g = ga(
    512, 512, setup
);

//Start the Ga engine.
g.start();

var antenna;
var signals;
var devices;
var message;
var gameScene;
var gameOverScene;

function getDirection() {
    return g.randomFloat(-1, 1);
}

function makeObjects(color, speed, x, y) {
    const numberOfObjects = 6;
    
    var objects = [];

    for (var i = 0; i < numberOfObjects; i++) {

        var object = g.rectangle(32, 32, color);

        object.x = x ? x : g.randomInt(0, g.canvas.width - object.height);
        object.y = y ? y : g.randomInt(0, g.canvas.height - object.width);

        object.vy = speed * getDirection();
        object.vx = speed * getDirection();

        objects.push(object);

        gameScene.addChild(object);
    }

    return objects;
}

function setup() {
    //Set the canvas border and background color
    g.canvas.style.border = "1px black solid";
    g.backgroundColor = "white";

    //Create the `gameScene` group
    gameScene = g.group();

    //The antenna
    antenna = g.circle(48, 48, "green");
    g.stage.putCenter(antenna, 0, 0);
    gameScene.addChild(antenna);

    devices = makeObjects("red", 4);
    signals = makeObjects("green", 2, g.canvas.width / 2, g.canvas.height / 2);

    //Add some text for the game over message
    message = g.text("Game Over!", "64px Futura", "black", 20, 20);
    message.x = 120;
    message.y = g.canvas.height / 2 - 64;

    //Create a `gameOverScene` group and add the message sprite to it
    gameOverScene = g.group(message);

    //Make the `gameOverScene` invisible for now
    gameOverScene.visible = false;

    //set the game state to `play`
    g.state = play;
}

function play() {
    //Loop through all the sprites in the `devices` array
    devices.forEach(function (device) {

        //Move the enemy
        g.move(device);

        //Check the device's screen boundaries
        var deviceHitsEdges = g.contain(device, g.stage.localBounds);

        //If the device hits the top or bottom of the stage, reverse
        //its direction
        if (deviceHitsEdges === "top" || deviceHitsEdges === "bottom") {
            device.vy *= -1;
        } else if (deviceHitsEdges === "left" || deviceHitsEdges === "right") {
            device.vx *= -1;
        }

        //check antenna collision
        if (g.hit(antenna, device)) {
            device.vy *= -1;
            device.vx *= -1;
        }
    });

    signals.forEach(function (signal) {
        g.move(signal);

        var signalHitsEdges = g.contain(signal, g.stage.localBounds);

        if (signalHitsEdges) {
            signal.x = g.canvas.width / 2;
            signal.y = g.canvas.height / 2;
            signal.vx *= getDirection();
            signal.vy *= getDirection();
        }
    });
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}