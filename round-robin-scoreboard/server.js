var express = require('express');
bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.urlencoded({ extended: true }));

var results;
var names;

if(typeof results === "undefined"){
    resetResults(3);
    resetNames(3);
}

function resetResults(size) {
    results = new Array(parseInt(size));

    //initialize array
    for (var i = 0; i < results.length; i++) {
        results[i] = new Array(parseInt(size));
    }
    //-1 = cannot change
    // 0 = neutral
    // 1 = win
    // 2 = loss
    // 3 = draw

    //populate array
    for (var x = 0; x < results.length; x++) {
        for (var y = 0; y < results[x].length; y++) {
            if (x == y) {
                results[x][y] = -1;
            } else {
                results[x][y] = 0;
            }
        }
    }
}

function resetNames(size){
    names = new Array(parseInt(size));
    
    for(var i = 0; i < names.length; i++){
        names[i] = i;
    }
}

server.post('/resetBracket', function(req, res){
    res.setHeader("Content-Type", "application/json");
    resetResults(req.body.quantity);
    res.write(JSON.stringify(results));
    res.end();
});

server.post('/resetNames', function(req,res){
    res.setHeader("Content-Type", "application/json");
    resetNames(req.body.quantity);
    res.write(JSON.stringify(names));
    res.end();
});

server.post('/updateResults', function(req, res) {
    results = req.body.newResults;
    res.end();
}); 

server.post('/getTable', function (req, res) {
    res.setHeader("Content-Type", "application/json");
    var data = {
        results: results,
        names: names
    };
    res.write(JSON.stringify(data));
    res.end();
});

server.post('/changeNames', function(req, res){
    names = req.body.names;
    res.end();
});

server.post('/changeQuantity', function(req, res){
    res.setHeader("Content-Type", "application/json");
    resetResults(req.body.quantity);
    resetNames(req.body.quantity);
    var data = {
        results: results,
        names: names
    };
    res.write(JSON.stringify(data));
    res.end();
});

server.use(express.static("./pub"));

server.listen(80, function () {
    console.log("Server listening on port 80");
});
