var express = require('express');
bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.urlencoded({extended:true}));

var theOffice = 0;

class Question {
    constructor (question, options, name){
        this.question = question;
        this.options = options;
        this.name = name;
        this.results = {};
        for(var option of this.options){
            this.results[option] = 0;
        }
    }

    updateResults(answer) {
        for(var option of this.options){
            if(option == answer){
                this.results[option] = this.results[option] + 1;
            }
        }
    }

    getResults(){
        return this.results;
    }
}

var survey = [
    new Question (
        "What is your favorite TV show?",
        [
            "The Office",
            "Parks and Rec",
            "Breaking Bad"
        ],
        "question1"
    ),
    new Question (
        "Do you like pineapple on pizza?",
        [
            "Yes",
            "No"
        ],
        "question2"
    ),
    new Question(
        "Where are you from?",
        [
            "Minnesota",
            "Michigan",
            "Wisconsin",
            "Iowa"
        ],
        "question3"
    )
];

server.post("/getQuestions", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(survey));
    res.end();
});

server.use("/vote", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    var allResults = [];
    for(var question of survey) {
        question.updateResults(req.body[question.name]);
        allResults.push(question.getResults());
    }
    res.json(allResults);
	res.end();
});

server.use(express.static("./pub"));

server.listen(80, function(){
    console.log("Server listening on port 80");
});
