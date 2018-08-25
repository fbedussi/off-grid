var antenna;
var signals = [];
var devices = [];
var message;
var gameScene;
var gameOverScene;
var score = 0;
var scoreDisplay;
var totalScore;

var g = ga(
    512, 512, setup,
    [
        'images/antenna.png',
        'images/signal.png',
        'images/nokia-3210.png',
        'images/shield.png',
        //'images/matrix.png',
    ]
);

//Start the Ga engine.
g.start();
g.scaleToWindow();
window.addEventListener("resize", function (event) {
    g.scaleToWindow();
});

function makeDevices(numberOfDevices) {
    const screenDuration = 3000;
    var devices = [];

    for (var i = 0; i < numberOfDevices; i++) {
        //var color = `rgb(${g.randomInt(0, 255)}, ${g.randomInt(0, 255)}, ${g.randomInt(0, 255)})`;
        var deviceFrames = [
            'images/nokia-3210.png',
            'images/shield.png'
        ];
        var device = g.sprite(deviceFrames);
        device.states = {
            normal: 0,
            shielded: 1
        };
        device.radius = g.randomInt(g.canvas.width / 4, (g.canvas.width - device.width) / 2);
        device.speed = g.randomFloat(0.001, 0.05) / device.radius * 70;
        device.angle = g.randomInt(0, 2 * Math.PI);
        device.interactive = true;
        device.press = function () {
            this.show(this.states.shielded);
            this.shielded = true;
            setTimeout(() => {
                this.show(this.states.normal);
                this.shielded = false;
            }, screenDuration);
        }

        devices.push(device);

        gameScene.addChild(device);
    }

    return devices;
}


function getDirection() {
    return g.randomFloat(-1, 1);
}

function makeSignals(numberOfSignals, speed) {
    var signals = [];

    for (var i = 0; i < numberOfSignals; i++) {
        var signal = g.sprite('images/signal.png');

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
    g.canvas.style.border = "1px black solid";
    g.backgroundColor = "white";

    gameScene = g.group();

    // var background = g.sprite('images/matrix.png');
    // gameScene.addChild(background);

    //The antenna
    antenna = g.sprite('images/antenna.png');
    g.stage.putCenter(antenna, 0, 0);
    
    devices = makeDevices(6);
    setTimeout(function() {
        signals = makeSignals(5, 2);
    }, 1000);
    
    scoreDisplay = g.text("score:" + score, "20px impact", "black", 400, 10);
    gameScene.add(antenna, scoreDisplay);

    //Add some text for the game over message
    message = g.text("Game Over!", "64px impact", "black", 120, g.canvas.height / 2 - 64);
    totalScore = g.text("", "25px impact", "black", 180, g.canvas.height / 2 + 25);
    var replay = g.text("replay", "32px impact", "black", 220, g.canvas.height / 2 + 64);
    var replayButton = g.rectangle(95, 50, "green", "", "", replay.x - 5, replay.y - 5);
    replayButton.interactive = true;
    replayButton.release = restart;

    //Create a `gameOverScene` group and add the message sprite to it
    gameOverScene = g.group(message, totalScore, replayButton, replay);

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
        scoreDisplay.content = "score: " + ++score;

        if (!device.shielded && signals.some((signal) => g.hitTestRectangle(device, signal))) {
            device.alpha = 0;
            score -= 100;
            devices = devices.filter((d) => d != device);
        }
    });

    signals.forEach(function (signal) {
        signal.x += signal.vx;
        signal.y += signal.vy;

        if (g.contain(signal, g.stage.localBounds)) {
            g.stage.putCenter(signal, 0, 0);
            signal.vx = signal.speed * getDirection();
            signal.vy = signal.speed * getDirection();
        }
    });

    if (devices.length < 2) {
        g.state = end;
    }
}

function end() {
    totalScore.content = "total score: " + score;
    gameScene.visible = false;
    gameOverScene.visible = true;
}

function restart() {
    gameScene.visible = true;
    gameOverScene.visible = false;
    g.remove(devices);
    g.remove(signals);
    g.remove(antenna);
    g.remove(scoreDisplay);

    setup();
}
