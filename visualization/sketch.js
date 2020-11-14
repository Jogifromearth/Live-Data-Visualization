const ws = new WebSocket('ws://localhost:1880/ws/receive');

let dataArray = [{
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

const useMouse = true;


ws.onopen = function (event) {
    console.log(event);
}

ws.onmessage = function (msg) {
    let data = JSON.parse(msg.data);

    if (useMouse) {
        data.joystick.x = mouseX;
        data.joystick.y = mouseY;
        if (mouseIsPressed) data.joystick.sw = 0;
    }

    dataArray.push(data);

    if (dataArray.length > 100) {
        dataArray.shift();
        console.log("Shift");
    }

    console.log(data);
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    background(10, 10, 10);
}


function draw() {
    background(10, 10, 10);

    dataArray.forEach(element => {
        let brightness = 500 / element.rgb.c;
        if (brightness < 1) {
            brightness = 1;
        }

        let x = element.joystick.x;
        let y = element.joystick.y;


        if (element.joystick.sw === 0) {
            fill(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness, 30);
            stroke(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness);
            ellipse(x, y, log(element.rgb.c) * 5 + 15, log(element.rgb.c) * 5 + 15);
        } else {
            fill(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness, 20);
            stroke(element.rgb.r * brightness, element.rgb.g * brightness, element.rgb.b * brightness);
            ellipse(x, y, log(element.rgb.c) * 5, log(element.rgb.c) * 5);

        }
    });
}