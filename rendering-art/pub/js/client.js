var ctx = document.getElementById('canvas').getContext('2d');
var color = 'FF0000';
ctx.strokeStyle = "#" + color;
var circle = true;

$('#circle').click(function(){
    $('#circle').attr("disabled", "true");
    $('#square').removeAttr("disabled");
    circle = true;
});

$('#square').click(function(){
    $('#circle').removeAttr("disabled");
    $('#square').attr("disabled", "true");
    circle = false;
});

$('#red').click(function(){
    $('#red').attr("disabled", "true");
    $('#blue').removeAttr("disabled");
    $('#green').removeAttr("disabled");
    color = 'FF0000';
    ctx.strokeStyle = "#" + color;
});

$('#green').click(function(){
    $('#green').attr("disabled", "true");
    $('#blue').removeAttr("disabled");
    $('#red').removeAttr("disabled");
    color = '00FF00';
    ctx.strokeStyle = "#" + color;
});

$('#blue').click(function(){
    $('#blue').attr("disabled", "true");
    $('#red').removeAttr("disabled");
    $('#green').removeAttr("disabled");
    color = '0000FF'
    ctx.strokeStyle = "#" + color;
});

$('#canvas').click(function (event) {
    var canvas = document.getElementById('canvas');
    var coord = getCursorPosition(canvas, event);
    coord.circle = circle;
    coord.color = color;
    if(circle){
        drawCircle(coord.x, coord.y);
    } else {
        drawSquare(coord.x, coord.y);
    }
    
    $.post('/recordPoint', coord, function(){
        console.log('ok');
    });
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x: x, y: y};
}

function drawCircle(xCoord, yCoord) {
    ctx.beginPath();
    ctx.arc(xCoord, yCoord, 20, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawSquare(xCoord, yCoord) {
    ctx.beginPath();
    ctx.rect(xCoord-15,yCoord-15, 30, 30);
    ctx.stroke();
}

$('#clear').click(function() {
    clearCanvas();
});
$('#restore').click(function(){
    window.location.reload();
});
$('#delete').click(function(){
    $.post('/deletePoints', {}, function(pointArray) {
        clearCanvas();
    });
});

function clearCanvas(){
    ctx.clearRect(0,0, canvas.width, canvas.height);
}

$.post('/getPoints', {}, function(pointArray) {
    // if(pointArray.length == 0){
    //     alert('No shapes stored on server.');
    // }
    for (var point of pointArray){
        ctx.strokeStyle = "#" + point.color;
        if(point.circle == "true"){
            drawCircle(point.x, point.y);
        } else {
            drawSquare(point.x, point.y);
        }
    }
    ctx.strokeStyle = "#" + color;
});