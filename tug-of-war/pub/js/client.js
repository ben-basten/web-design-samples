var socket = io();

/*     VUE     */
var vm = new Vue({
    el: "#app",
    data: {
        dogOffset: 0,
        roomId: null,
        direction: "Left"
    },
    methods: {
        currentDogOffset() {
            return {
                left: this.dogOffset+"px"
            };
        },
        changeOffset(direction){
            if(direction == 'Right'){
                this.dogOffset += 2;
            } else {
                this.dogOffset -= 2;
            }
            socket.emit("positionChange", {room: this.roomId, position: this.dogOffset});
        },
        reset(){
            this.dogOffset = 0;
            $('#reset').fadeOut('fast');
            socket.emit("reset", {room: this.roomId});
        },
        generateMessage(winningDirection) {
            if(winningDirection == this.direction) {
                return "YOU WIN!";
            } else {
                return "you lose :(";
            }
        }
    },
    computed: {
        checkWin(){
            if(this.dogOffset == 64) {
                $('.gameButton').attr("disabled", "true");
                $('#reset').fadeIn('fast');
                return this.generateMessage('Right');
            } else if (this.dogOffset == -64) {
                $('.gameButton').attr("disabled", "true");
                $('#reset').fadeIn('fast');
                return this.generateMessage('Left');
            } else {
                return;
            }
        }
    }
});




/*  PAGE LOAD */
if(document.cookie != "") {
    socket.emit('join', {room: getCookie('room'), onLoad: true});
}




/*  General Functions   */
function showError(message) {
    $('#error').hide();
    $('#error').html(message);
    $('#error').fadeIn('fast');
    deleteCookies();
}

function returnToLobby() {
    $('#waitingContainer').hide();
    $('#app').hide();
    $('#lobby').fadeIn();
}

function startCountdown() {
    $('#waitingContainer').hide();
    $('#app').css({
        "-webkit-filter": "blur(10px)",
        "filter": "blur(10px)"
    });
    $('.gameButton').attr("disabled", "true");
    var count = 3;
    $('#count').html(count);
    var timer = setInterval(function() {doCount(count, timer); count--;}, 1000);
}

function doCount(count, timer) {
    if(count === 0) {
        clearInterval(timer);
        startGame();
    } else {
        $('#countdown').fadeIn('fast');
        $('#count').html(count);
    }
}

function startGame() {
    vm.dogOffset = 0;
    $('#countdown').fadeOut('fast');
    $('#app').css({
        "-webkit-filter": "blur(0px)",
        "filter": "blur(0px)"
    });
    $('.gameButton').removeAttr("disabled");
}

function joinGame() {
    if($('#gameId').val() != ''){
        socket.emit('join', { room: $('#gameId').val()});
        $('#gameId').val('');
        $('#error').hide();
    } else {
        $('#gameId').blur();
        showError('Please enter a Game ID.');
    }
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
} //from StackOverflow

function deleteCookies() {
    document.cookie = "room=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
}



/*  jQUERY EVENTS   */
$('#newGame').click(function() {
    socket.emit('create');
    $('#error').hide();
});

$('#joinGame').click(function() {
    joinGame();
});

$('#leave').click(function() {
    socket.emit('leave', {room: vm.roomId});
    deleteCookies();
    returnToLobby();
});

$('#cancel').click(function () {
    returnToLobby();
    socket.emit('cancel', { room: vm.roomId });
})

$('#gameId').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        joinGame();
    }
});



/*  SOCKET.IO   */
socket.on('newGame', function(data) {
    vm.roomId = data.room;
    $('#roomId').html('Room Id: ' + data.room);
    $('#app').fadeIn();
    $('#lobby').hide();
    $('#waitingContainer').fadeIn(500);
    $('#app').css({
        "-webkit-filter": "blur(10px)",
        "filter": "blur(10px)"
    });
    $('.gameButton').attr("disabled", "true");
});

socket.on('player1', function(data) {
    document.cookie = "room=" + data.room;
    vm.direction = "Left";
    $('#greeting').html('Welcome PLAYER 1!');
});

socket.on('player2', function(data) {
    document.cookie = "room=" + data.room;
    vm.roomId = data.room;
    vm.direction = "Right";
    vm.dogOffset = 0;
    $('#greeting').html('Welcome PLAYER 2!');
    $('#app').fadeIn(200);
    $('#lobby').hide();
});

socket.on('startCountdown', function() {
    startCountdown();
});

socket.on('newError', function(data) {
    showError(data.error);
});

socket.on("updatePosition", function(data) {
    vm.dogOffset = data.position;
});

socket.on("resetGame", function(data){
    $('#reset').fadeOut('fast');
    startCountdown();
});