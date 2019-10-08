$(document).ready(function () {
    $('#vote').submit(function () {
        var action = $(this).attr('action');
        $('.alert').hide();
        $.post($(this).attr('action'), $(this).serialize(), function(response){
            resetQuestions();
            var count = 0;
            var content = "";
            for(question of response){
                count++;
                content += '<b>Question ' + count + "</b><br>";
                var results = Object.entries(question);
                for(eachResult of results){
                    content += eachResult[0] + ": " + eachResult[1] + "<br>";
                } 
            }
            $('#counts').html(content);
            $('#results').fadeIn('fast');
        }, 'json');
        return false;
    });

    $('#reset').click(function(){
        resetQuestions();
        $('.alert').fadeOut('fast');
    });

    $('input:radio').change(function(){
        $('.alert').fadeOut('fast');
    });
});

function resetQuestions(){
    $('input').each(function(){
        $(this).prop('checked', false);  
    });
}

var vm = new Vue({
    el: "#content", 
    data: {
       message: "hello",
       survey: null
    }, 
    methods: {
        setSurvey(survey){
            this.survey = survey;
        }
    }, 
    computed: {},
    // template: 'hello'  //use templates to put data somewhere other than #app  
});

$.post("/getQuestions", {}, function(response){
    vm.setSurvey(response);
}, 'json');


//TODO: make questions an object
// class Question {
//     constructor(question, options)
// }