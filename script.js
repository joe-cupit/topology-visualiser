// drawing canvas
const canvas = document.getElementById('drawingCanvas');
// initialising canvas
canvas.width = 800;
canvas.height = 800;
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;
// setting canvas context
const ctx = canvas.getContext('2d', {willReadFrequently: true});
ctx.lineWidth = 2;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// display canvas
const display = document.getElementById('displayCanvas');
// initialising display canvas
display.width = 800;
display.height = 500;
// setting display canvas
const dsp = display.getContext('2d');


// rotating canvas
const rotated = document.createElement('canvas');
const rtd = rotated.getContext('2d');
rotated.width = 800;
rotated.height = 800;
// document.body.append(rotated);


function makeCanvasDrawable() {
    // setting canvas functions
    canvas.onmousedown = clickCanvas;
    canvas.onmousemove = null;
    canvas.onmouseup = null;

    // to store line coordinates
    var currentLine = new Path2D();

    function clickCanvas(e) {
        // start drawing the line
        startX = e.clientX - canvasOffsetX+window.scrollX;
        startY = e.clientY - canvasOffsetY+window.scrollY;
        ctx.lineTo(startX, startY);
        currentLine.lineTo(startX, startY);
        ctx.stroke();

        canvas.onmousemove = drawCanvas;
        canvas.onmouseup = stopDrawing;
    }

    function drawCanvas(e) {
        // draw to the next point
        newX = e.clientX-canvasOffsetX+window.scrollX;
        newY = e.clientY-canvasOffsetY+window.scrollY;

        ctx.lineTo(newX, newY);
        currentLine.lineTo(newX, newY);
        ctx.stroke();
    }

    function stopDrawing(e) {
        // stop and save the line
        ctx.lineTo(startX, startY);
        currentLine.lineTo(startX, startY);
        ctx.stroke();
        ctx.beginPath();

        canvas.onmousemove = null;
        canvas.onmouseup = null;

        currentLine.closePath();

        pathList.push(new Path2D(currentLine));
        currentLine = new Path2D();

        drawTopology();
    }
}

function clearAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dsp.clearRect(0, 0, display.width, display.height);
    pathList = [];
}

function rotateCanvas(cvs, angle) {
	cvs.translate(400, 400);
	cvs.rotate(angle*Math.PI/180);
	cvs.translate(-400, -400);
}


function numberOfPaths(can, x, y) {
    pathCount = 0;
    for (let path of pathList) {
        if (can.isPointInPath(path, x, y)) {
            pathCount += 1;
        }
    }
    return pathCount;
}


function drawTopology() {
	rtd.clearRect(0, 0, rotated.width, rotated.height);
	rotateCanvas(rtd, rotated_value);
	for (var path of pathList) {
        rtd.fill(path);
    }

    dsp.clearRect(0, 0, display.width, display.height);
    for (let y=1; y<800; y+=5) {
        s = 170-Math.floor((y/800)*170);
        dsp.fillStyle = "rgba("+s+","+s+","+s+",255)";

        height_value = 50;

        dsp.beginPath();
        dsp.moveTo(0, display.height);
        currLvl = 0;
        for(let x=1; x<800; x+=5) {
            newLevel = numberOfPaths(rtd, x, y);
            if (newLevel != currLvl) {
                if (newLevel > currLvl) {
                    dsp.lineTo(x, display.height-height_value*(newLevel-1));
                }
                else if (newLevel < currLvl) {
                    dsp.lineTo(x, display.height-height_value*(newLevel));
                }
                currLvl = newLevel;
            }
        }
        dsp.lineTo(800, display.height);
        dsp.fill();
    }

    rotateCanvas(rtd, -rotated_value);
}


const sliderOutput = document.getElementById('sliderOutput');
function sliderChanged() {
    sliderOutput.value = rotateSlider.value;
	rotated_value = 360 - rotateSlider.value;
	drawTopology();
};


document.onkeydown = function(e) {
    if (e.key == 'ArrowLeft') {
        rotateSlider.blur();
        var deg = parseInt(rotateSlider.value);
        deg -= 10;
        if (deg < 0) deg += 360;
        rotateSlider.value = deg;
        sliderChanged();
    }
    else if (e.key == 'ArrowRight') {
        rotateSlider.blur();
        var deg = parseInt(rotateSlider.value);
        deg += 10;
        if (deg > 360) deg -= 360;
        rotateSlider.value = deg;
        sliderChanged();
    }
}


const rotateSlider = document.getElementById("rotateSlider");
var rotated_value = rotateSlider.value;
/* rotateSlider.onchange = sliderChanged; */


let pathList = [];
makeCanvasDrawable(canvas);
