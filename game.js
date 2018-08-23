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


function getDirection() {
    return g.randomFloat(-3, 3);
}

function makeSignals() {
    const numberOfSignals = 6;
    const signalSize = 5;
    const signalColor = "grey"
    const speed = 1;

    var signals = [];

    for (var i = 0; i < numberOfSignals; i++) {
        var signal = g.rectangle(signalSize, signalSize, signalColor);

        g.stage.putCenter(signal, 0, 0);
        signal.speed = speed;
        signal.vy = signal.speed * getDirection();
        signal.vx = signal.speed * getDirection();

        signals.push(signal);

        gameScene.addChild(signal);
    }

    return signals;
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
    signals = makeSignals();


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

        if (!device.lineWidth && signals.some((signal) => g.hitTestRectangle(device, signal))) {
            device.alpha = 0;
            devices = devices.filter((d) => d != device);
        }
    });

    signals.forEach(function (signal) {
        g.move(signal);

        if (g.contain(signal, g.stage.localBounds)) {
            g.stage.putCenter(signal, 0, 0);
            signal.vx = signal.speed * getDirection();
            signal.vy = signal.speed * getDirection();
        }
    });

    if (!devices.length) {
        g.state = end;
        message.content = "Game over!";
      }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}