const ws = new WebSocket('ws://localhost:1880/ws/receive');

let sensorData = [{
    rgb: {
        r: 0,
        g: 0,
        b: 0,
        c: 0
    },
    joystick: {
        x: 0,
        y: 0,
        sw: 0
    }
}];

const useMouse = true; //true for using mouse, false for using joystick

let targetData = [{
    x: 150,
    y: 150,
    ø: 200,
    color: 0
}];

let score = 0;
let timeLeft = 5;


ws.onopen = function (event) {
    console.log(event);
}

//Called every time a data object is received from client
ws.onmessage = function (msg) {
    //Storing WebSocket-Data into a JSON object
    let data = JSON.parse(msg.data);

    //Changing joystick values to mouse position, if useMouse is true
    if (useMouse) {
        data.joystick.x = mouseX;
        data.joystick.y = mouseY;
        if (mouseIsPressed) data.joystick.sw = 0;
    }
    //Pushing the data object an array
    sensorData.push(data);

    //Removing oldest object from the data array, if lenght hits certain amount
    if (sensorData.length > 50) {
        sensorData.shift();
    }
    // console.log(data);
}


//Set-Up for P5 - called once at program start
function setup() {
    createCanvas(windowWidth, windowHeight);
    background(10, 10, 10);

    targetData = [{
        x: windowWidth / 2,
        y: windowHeight / 2,
        ø: 200,
        color: color(255, 200, 10)
    }];

    replayButton = {
        x: windowWidth / 2,
        y: windowHeight / 2
    };

    score = 0;
    timeLeft = 8;

    textAlign(LEFT);
}


//Draw loop for P5 - called every frame
function draw() {
    background(10, 10, 10);

    if (frameCount % 60 == 0 && timeLeft > 0) { //if the frameCount is divisible by 60, a second is passed. Once the timer hits 0, it stops
        timeLeft--;
    }

    let scoreText = `SCORE: ${score}`;
    let timerText = `${timeLeft}`;

    if (timeLeft == 0) { //displaying 'Game Over' and the final score, when the time is over and the target wasn't hit
        targetData[0].ø = 0;
        fill(targetData[0].color);
        noStroke();
        textSize(100);
        text('GAME OVER', width / 2, height / 2);
        textSize(60);
        text(`SCORE: ${score}`, width / 2, height / 1.6);
        textAlign(CENTER);
    } else { //displaying the current score and the time left, when the game is still ongoing
        fill(targetData[0].color);
        noStroke();
        textSize(36);
        text(scoreText, 50, 50);
        text(timerText, windowWidth / 2, 50);
    }


    //Code to be executed when the player hits the target with the right color
    if (targetHit(targetData[0].x, targetData[0].y, targetData[0].ø)) {
        score++;
        timeLeft = 8;

        //Randomize spawn position and diameter of the new target
        let randomX = Math.floor((Math.random() * windowWidth) + 1);
        let randomY = Math.floor((Math.random() * windowHeight) + 1);
        let randomØ = Math.floor((Math.random() * 180) + 80); //Random Value from 80 to 260

        //Checking if the hue is within a certain range, to avoid certain colors
        let randomHue = random(360);
        if (randomHue < 333 && (randomHue > 250)) randomHue = random(360);

        //Changing color mode to hsb format, to make sure saturation and brightness of the target can be set to fixed value
        colorMode(HSB, 360);

        //Creating a new target, at random position, with random size and random color
        let data = {
            x: randomX,
            y: randomY,
            ø: randomØ,
            color: color(randomHue, 360, 300)
        };
        targetData.push(data); //pushing that new target object to the targetData array

        colorMode(RGB, 255);

        //Making sure old target disapears, when a new one apears
        if (targetData.length > 1) {
            targetData.shift();
        }
        console.log('Target hit! – Score: ' + score);

        // console.log('ø: ' + targetData[0].ø);
    }

    targetData.forEach(element => {
        target(element.x, element.y, element.ø, element.color);
    });

    //Drawing the data for each data object of the data array
    sensorData.forEach(element => {

        //Defining how the ellipses, that vizualize the sensor data, look like
        function rgbDataViz(alpha, size, locX, locY, element) {
            fill(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness, alpha);
            stroke(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness);
            ellipse(locX, locY, log(element.rgb.c) * 5 + size, log(element.rgb.c) * 5 + size);
        }

        //Setting a brightness variable, to reduce the amount of dark colors
        let brightness = 500 / element.rgb.c;
        if (brightness < 1) {
            brightness = 1;
        }

        //Mapping joystick values to canvas size
        let x = map(element.joystick.x, 0, 1023, 0, width);
        let y = map(element.joystick.y, 0, 1023, 0, height);

        //Drawing the data on the canvas
        if (element.joystick.sw === 0) {
            rgbDataViz(40, 30, x, y, element);
        } else {
            rgbDataViz(20, 2, x, y, element);
        }
    });
}
if (gameOver == true) {
    replayButton = createButton('REPLAY');
    replayButton.position(width / 2, height / 1.4);
    replayButton.mousePressed(resetCanvas());
}

function target(x, y, ø, col) {
    //defining the look of the target, based on it's parameters
    fill(col);
    noStroke();
    ellipse(x, y, ø, ø);
}

function targetHit(posX, posY, diameter) {
    //checking if target is hit

    //Storing latest rgb data a color variable
    let rgbData = color(sensorData[sensorData.length - 1].rgb.r, sensorData[sensorData.length - 1].rgb.g, sensorData[sensorData.length - 1].rgb.b);

    //Checking if the hue of the rgb data matches the hue of the target
    let similarCol = ((hue(targetData[0].color) - 15) < hue(rgbData)) && (hue(rgbData) < (hue(targetData[0].color) + 15));

    //Checking if the mapped joystick data 
    let samePos = (mouseX < (posX + diameter / 2.5)) && (mouseX > (posX - diameter / 2.5)) && (mouseY < (posY + diameter / 2.5)) && (mouseY > (posY - diameter / 2.5));

    if (similarCol && samePos) {
        console.log(`rgbData Hue: ${hue(rgbData)}
        target Hue: ${hue(targetData[0].color)}`);
    }

    return (similarCol && samePos && timeLeft ? true : false);
}