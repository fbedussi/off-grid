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


function makeDevices(numberOfDevices, deviceSize) {
    var devices = [];

    for (var i = 0; i < numberOfDevices; i++) {
        var color = `rgb(${g.randomInt(0, 255)}, ${g.randomInt(0, 255)}, ${g.randomInt(0, 255)})`;
        var device = g.rectangle(deviceSize, deviceSize, color, "black");

        device.interactive = true;
        device.radius = g.randomInt(g.canvas.width / 4, (g.canvas.width - deviceSize) / 2);
        device.speed = g.randomFloat(0.001, 0.035);
        device.angle = 0;
        device.press = function() {
            this.lineWidth = 5;
            setTimeout(() => {
                this.lineWidth = 0;
            }, 2000);
        }

        devices.push(device);

        gameScene.addChild(device);
    }

    return devices;
}

function setup() {
    const antennaRadius = 40;

    //Set the canvas border and background color
    g.canvas.style.border = "1px black solid";
    g.backgroundColor = "white";
    //Create the `gameScene` group
    gameScene = g.group();

    //The antenna
    antenna = g.circle(antennaRadius, antennaRadius, "green");
    g.stage.putCenter(antenna, 0, 0);
    gameScene.addChild(antenna);

    devices = makeDevices(6, 30);

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
    devices.forEach(function (device) {
        device.x = (g.canvas.width - device.width) / 2 + Math.cos(device.angle) * device.radius;
        device.y = (g.canvas.height - device.height) / 2 + Math.sin(device.angle) * device.radius;
        device.angle += device.speed;
    });
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}