
var express = require("express"); //load up another module we will need (express)
var bodyParser = require("body-parser");
var app = express(); //Instantiating a server
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('pub')); //to serve up .txt, .html, .jpg, etc. files.

var arrayOfClicks = [];

app.post("/getPoints", function(req, res){
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(arrayOfClicks));
    res.end();
});

app.post("/deletePoints", function(req, res){
    arrayOfClicks = [];
    res.end();
});

app.post("/recordPoint", function(req, res) {
    var x = req.body.x;
    var y = req.body.y;
    var circle = req.body.circle;
    var color = req.body.color;
    var coord = {
        x,
        y,
        circle,
        color
    }
    arrayOfClicks.push(coord);
    console.log(arrayOfClicks[arrayOfClicks.length - 1]);
    // console.log(arrayOfClicks);
    res.end();
});

// 80 is the standard port for HTTP
app.listen(80, function() {
    //This function is only executed once the server is ready.
    console.log("Server is waiting on port 80");
});

