var planner, can, ctx, flag = false,
    prevX = 0, currX = 0,
    prevY = 0, currY = 0,
    dot_flag = false;

var draw_color = "black", draw_width = 2;

function init() {
    can = document.getElementById('can');
    ctx = can.getContext("2d");
    cansolve = document.getElementById('cansolve');
    ctxsolve = cansolve.getContext("2d");
    heuristic = document.getElementById('heuristic');

    // load default image into canvas
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
    };
    img.src = "default.png";

    w = can.width;
    h = can.height;

    can.addEventListener("mousemove", function (e) { findxy('move', e) }, false);
    can.addEventListener("mousedown", function (e) { findxy('down', e) }, false);
    can.addEventListener("mouseup", function (e) { findxy('up', e) }, false);
    can.addEventListener("mouseout", function (e) { findxy('out', e) }, false);
}

// sets drawing color
function color(obj) {
    draw_color = obj.id;
    if (draw_color == "white") draw_width = 3;
    else draw_width = 2;

    // keep button visually pressed
    document.getElementById('black').classList.remove("pressed");
    document.getElementById('white').classList.remove("pressed");
    obj.classList.add("pressed");
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - can.offsetLeft;
        currY = e.clientY - can.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = draw_color;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - can.offsetLeft;
            currY = e.clientY - can.offsetTop;
            draw();
        }
    }
}

// draws calculated line
function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = draw_color;
    ctx.lineWidth = draw_width;
    ctx.stroke();
    ctx.closePath();
}

// draw point from solving proccess
function drawPoint(position, color) {
    ctxsolve.fillStyle = color;
    ctxsolve.fillRect(position[0], position[1], 1, 1);
}

// clears canvas
function clr() {
    ctx.clearRect(0, 0, w, h);
}

function solve() {
    // terminate running planner
    if (planner) {
        planner.terminate();
    }

    // get drawn image and copy
    var drawing = ctx.getImageData(0, 0, w, h);
    ctxsolve.putImageData(drawing, 0, 0);

    // create simple array to solve
    var problem = new Array(w);
    for (var x = 0; x < w; x++) {
        problem[x] = new Array(h);
        for (var y = 0; y < h; y++) {
            var i = (y * w + x) * 4;
            // compress to binary
            if (drawing.data[i] < 255 / 2 && drawing.data[i + 1] < 255 / 2 && drawing.data[i + 2] < 255 / 2 && drawing.data[i + 3] > 255 / 2) {
                problem[x][y] = 1; // wall
            } else {
                problem[x][y] = 0; // free
            }
        }
    }

    // initialize planner thread
    planner = new Worker('planner.js');

    // retrieve paint task from planner
    planner.addEventListener('message', function (e) {
        if (typeof e.data == 'string') {
            alert(e.data);
        } else {
            drawPoint(e.data[0], e.data[1]);
        }
    }, false);

    // start solving thread
    planner.postMessage([problem, [0, 0], [w - 1, h - 1], parseInt(heuristic.value)]);
}