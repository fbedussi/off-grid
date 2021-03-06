var antenna;
var signals = [];
var devices = [];
var message;
var gameScene;
var gameOverScene;
var score = 0;
var scoreDisplay;
var totalScore;
var signalSpeed = 2;

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
    var screenDuration = 4000;
    var screenAlertStart = 2000;
    var screenAlertFrequency = 200;
    var devices = [];
    var radiusExternalLimit = 10;
    var radiusInternalLimit = (g.canvas.width / 2) - 30; 
    var radiusInterval = (radiusInternalLimit - radiusExternalLimit) / numberOfDevices;
    
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
        device.radius = radiusInternalLimit - (radiusExternalLimit + (radiusInterval * i));
        device.speed = g.randomFloat(0.001, 0.05) / device.radius * 70;
        device.angle = g.randomInt(0, 2 * Math.PI);
        device.interactive = true;
        device.press = function () {
            clearInterval(this.screenAlertInterval);
            clearTimeout(this.endScreenTimeout);
            clearTimeout(this.screenAlertStart);
            this.show(this.states.shielded);
            this.shielded = true;
            this.screenAlertStart = setTimeout(() => {
                let status = 1;
                this.screenAlertInterval = setInterval(() => {
                    status = status ? 0 : 1;
                    this.show(status);
                }, screenAlertFrequency);
            }, screenAlertStart);
            this.endScreenTimeout = setTimeout(() => {
                clearInterval(this.screenAlertInterval);
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

function makeSignal(speed) {
    var signal = g.sprite('images/signal.png');

    g.stage.putCenter(signal, 0, 0);
    signal.speed = speed;
    signal.vy = signal.speed * getDirection();
    signal.vx = signal.speed * getDirection();
    setInterval(() => {
        if (signal.scaleX === 1) {
            signal.scaleX = 0.5;
            signal.scaleY = 0.5;
        } else {
            signal.scaleX = 1;
            signal.scaleY = 1;
        }
    }, 100)

    signals.push(signal);

    gameScene.addChild(signal);
}

function makeSignals(numberOfSignals, speed) {
    signals = [];
    for (var i = 0; i < numberOfSignals; i++) {
        makeSignal(speed);
    }
}

var ctx = g.canvas.getContext("2d", {alpha: false});       // context without alpha channel.
var time;

function noise(ctx) {
    var imgd = ctx.createImageData(g.canvas.width, g.canvas.height);
    var pix = imgd.data;
  
    for (var i = 0, n = pix.length; i < n; i += 3) {
        pix[i] = pix[i+1] = pix[i+2] = 10 * Math.random() * time;
        //pix[i+3] = 255; // 100% opaque
    }
  
    ctx.putImageData(imgd, 0, 0);
    time = (time + 1) % g.canvas.height;
}

function setup() {
    g.backgroundColor = "white";
    time = 0;

    gameScene = g.group();

    antenna = g.sprite('images/antenna.png');
    g.stage.putCenter(antenna, 0, 0);
    
    devices = makeDevices(7);
    var signalCreationInterval = setInterval(function() {
        makeSignal(signalSpeed);
        if (signals.length > 4) {
            clearInterval(signalCreationInterval);
        }
    }, 1000);

    
    scoreDisplay = g.text("score:" + score, "20px impact", "black", 400, 10);
    gameScene.add(antenna, scoreDisplay);

    message = g.text("Game Over!", "64px impact", "black", 120, g.canvas.height / 2 - 64);
    totalScore = g.text("", "25px impact", "black", 180, g.canvas.height / 2 + 20);
    var replay = g.text("replay", "32px impact", "black", 220, g.canvas.height / 2 + 64);
    var replayButton = g.rectangle(95, 50, "green", "", "", replay.x - 5, replay.y - 5);
    replayButton.interactive = true;
    replayButton.release = restart;

    gameOverScene = g.group(message, totalScore, replayButton, replay);

    gameOverScene.visible = false;

    g.state = play;
}

function play() {
    noise(ctx);

    devices.forEach(function (device) {
        device.x = (g.canvas.width - device.width) / 2 + Math.cos(device.angle) * device.radius;
        device.y = (g.canvas.height - device.height) / 2 + Math.sin(device.angle) * device.radius;
        device.angle += device.speed;
        scoreDisplay.content = "score: " + ++score;

        if (!device.shielded && signals.some((signal) => g.hitTestRectangle(device, signal))) {
            device.shielded = false;
            device.alpha = 0;
            score -= 100;
            makeSignal(signalSpeed);
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

    if (devices.length < 3) {
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
