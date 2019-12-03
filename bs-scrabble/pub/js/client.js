var socket = io();

socket.on("gameOver", function (data) {
    vm.playerOneScore = data.player1points;
    vm.playerTwoScore = data.player2points;
    vm.gameOver = true;
    if (data.tie) {
        displayTie();
    } else if (data.playerOneWin && vm.userId == vm.playerOneName) {
        displayWin();
    } else if (!data.playerOneWin && !data.tie && vm.userId == vm.playerTwoName) {
        displayWin();
    } else {
        displayLoss();
    }
});

socket.on("playMove", function (data) {
    if (!data.isError) {
        vm.gameBoard = data.gameState.board;
        vm.playerOneScore = data.gameState.player1Score;
        vm.playerTwoScore = data.gameState.player2Score;
        vm.playerOneName = data.gameState.player1;
        vm.playerTwoName = data.gameState.player2;
        vm.tilesRemaining = data.gameState.remainingLetters;
        vm.previousMove = data.gameState.move;
        if (vm.userId == data.gameState.player1){
            vm.myTurn = data.gameState.isPlayer1Turn;
            vm.letterTray = data.gameState.player1Tray;
            if(!vm.myTurn) displayAlert("Move successful! Waiting for opponent to make a move.", true);
            else displayAlert("The opponent made a move. It's your turn!", true);
        }
        else{
            vm.myTurn = !data.gameState.isPlayer1Turn;
            vm.letterTray = data.gameState.player2Tray;
            if(!vm.myTurn) displayAlert("Move successful! Waiting for opponent to make a move.", true);
            else displayAlert("The opponent made a move. It's your turn!", true);
        }
    } else {
        displayAlert(data.errorMessage);
    }
});

socket.on("getGame", function (data) {
    if(!data.isError){
        changeColors('#ececec');
        vm.previousMove = null;
        vm.gameOver = false;
        vm.result = null;
        vm.gameBoard = data.board;
        vm.playerOneScore = data.player1Score;
        vm.playerTwoScore = data.player2Score;
        vm.myTurn = data.isMyTurn;
        vm.playerOneName = data.player1;
        vm.playerTwoName = data.player2;
        vm.tilesRemaining = data.remainingLetters;
        vm.letterTray = data.playerTray;
        vm.userId = data.whoAmI;
    }
    else {
        displayAlert(data.errorMessage);
        $('#app').remove();
    }
});

// socket.on("rematch", function (data) {
//     vm.gameOver = false;
//     vm.result = null;
//     changeColors('#ececec');
//     vm.gameBoard = data.board;
//     vm.playerOneScore = data.player1Score;
//     vm.playerTwoScore = data.player2Score;
//     vm.previousMove = null;
//     if (vm.userId == data.player1){
//         vm.myTurn = data.isMyTurn;
//         vm.letterTray = data.player1Tray;
//     }
//     else{
//         vm.myTurn = !data.isMyTurn;
//         vm.letterTray = data.player2Tray;
//     }
//     vm.tilesRemaining = data.remainingLetters;
// });

socket.on("newClientCount", function(count) {
    vm.clientCount = count;
});

socket.on("updateNames", function(data) {
    if(vm.userId == vm.playerOneName) {
        vm.userId = data.player1;
    } else {
        vm.userId = data.player2;
    }
    vm.playerOneName = data.player1;
    vm.playerTwoName = data.player2;
}); 

/*     VUE     */
var vm = new Vue({
    el: "#app",
    data: {
        gameBoard: [],
        userId: null,
        playerOneName: "Benjamin",
        playerTwoName: "Sam",
        playerOneScore: 0,
        playerTwoScore: 0,
        tilesRemaining: 98,
        gameOver: false,
        myTurn: true,
        // stores a string with the previous move and points
        previousMove: null,
        result: null,
        letterTray: [],
        letterPoints: { "A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 5, "L": 1, "M": 3, "N": 1, "O": 1, "P": 3, "Q": 10, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 4, "X": 8, "Y": 4, "Z": 10 },
        clientCount: 0
    },
    methods: {
        // on letter drop, places letter on the board and removes the letter from its previous location
        dropOnBoard(event, row, col) {
            event.preventDefault();
            //getting coordinate data from the drag and drop dataTransfer
            var data = event.dataTransfer.getData("coords");
            var oldIndex = JSON.parse(data);

            var square = this.gameBoard.board[row][col];
            square.isNew = true;
            // removes letter from tray if it is coming from the letter tray
            if (typeof oldIndex.trayIndex !== "undefined") {
                this.gameBoard.board[row][col].letter = this.letterTray[oldIndex.trayIndex];
                this.gameBoard.board[row][col].isNew = true;
                this.letterTray.splice(oldIndex.trayIndex, 1);
            // removes letter from previous position on the board if it is coming from the gameBoard
            } else {
                //sets new letter
                this.gameBoard.board[row][col].letter = this.gameBoard.board[oldIndex.row][oldIndex.col].letter;
                this.gameBoard.board[row][col].isNew = true;
                //removes previous letter
                this.gameBoard.board[oldIndex.row][oldIndex.col].letter = null;
                this.gameBoard.board[oldIndex.row][oldIndex.col].isNew = false;
            }
        },
        // on letter drop when dragging letter from gameBoard back into the letter tray
        dropOnTray(event) {
            event.preventDefault();
            var data = event.dataTransfer.getData("coords");
            var index = JSON.parse(data);
            // prevents an error when dragging a letter from the letter tray back into the tray
            if (typeof index.trayIndex === "undefined") {
                var oldSquare = this.gameBoard.board[index.row][index.col];
                oldSquare.isNew = false;
                this.letterTray.push(oldSquare.letter);
                oldSquare.letter = null;
                this.gameBoard.board[index.row].splice(index.col, 1, oldSquare);
            } 
        },
        // on drag start, gets letter index in tray for when the letter is dropped on the board
        dragFromTray(event, index) {
            var coords = {
                trayIndex: index
            };
            var stringToSend = JSON.stringify(coords);
            event.dataTransfer.setData('coords', stringToSend);
        },
        // on drag start, gets letter coordinates on gameBoard for when letter is dropped in its final destination
        dragFromBoard(event, row, col) {
            var coords = {
                row: row,
                col: col
            };
            var stringToSend = JSON.stringify(coords);
            event.dataTransfer.setData('coords', stringToSend);
        },
        // if there is already a letter in that square, don't allow a new letter to be dropped there
        allowDrop(event, square) {
            if (square.letter == null) {
                event.preventDefault();
            }
        },
        // brings a letter back to the tray if it is double clicked
        returnLetter(row, col) {
            if(this.gameBoard.board[row][col].isNew) {
                var letter = this.gameBoard.board[row][col].letter;
                
                // remove letter from the gameBoard
                this.gameBoard.board[row][col].letter = null;
                this.gameBoard.board[row][col].isNew = false;

                // add letter back to the tray
                this.letterTray.push(letter);
            }
        },
        // adds all letters on the board back to the letter tray
        resetBoard() {
            for (var row = 0; row < this.gameBoard.board.length; row++) {
                for (var col = 0; col < this.gameBoard.board[row].length; col++) {
                    square = this.gameBoard.board[row][col];
                    // if the letter is a new letter, add it back to the tray
                    if (square.isNew) {
                        this.letterTray.push(square.letter);
                        square.letter = null;
                        square.isNew = false;
                        this.gameBoard.board[row].splice(col, 1, square);
                    }
                }
            }
        },
        shuffleTray() {
            // Fisher-Yates Shuffle Algorithm
            var newTray = this.letterTray;
            for (var i = (newTray.length - 1); i > 0; i--) {
                var j = Math.floor(Math.random() * i);
                var temp = newTray[i];
                newTray[i] = newTray[j];
                newTray[j] = temp;
            }
            this.letterTray = newTray;
            this.letterTray.splice();
        },
        playMove() {
            socket.emit("playMove", { board: this.gameBoard.board, tray: this.letterTray });
        },
        rematch() {
            socket.emit("rematch", { });
        },
        changeName(newName) {
            socket.emit("changeName", {name: newName});
        },
        showInput() {
            displayInput("Please enter a new name.");
        },
        newGame() {
            displayAlert("This feature has not been implemented yet.", false);
        },
        passMove() {
            socket.emit("passMove", { pass: true });
        },
        hasLetter(square) {
            return square.letter != null;
        },
        // checks if square should be styled as a special square
        isSpecial(square) {
            return square.special && !square.letter;
        },
        // checks if square should be styled as a played letter
        isExistingLetter(square) {
            return square.letter != null && !square.isNew;
        },
        // checks if square should be styled as a new letter just placed on the board
        isNewLetter(square) {
            return square.letter != null && square.isNew;
        },
        removeLetter(square) {
            square.letter = null;
            square.isNew = null;
        },
        isCenter(square) {
            return square.special == 'center' && !this.hasLetter(square);
        }
    },
    computed: {}
});

function switchTab(event) {
    var links = $('.tablinks');
    var newTab = $(event.target).text();
    $('.tabContent').hide();

    for (i = 0; i < links.length; i++) {
        links[i].className = links[i].className.replace(" active", "");
    }
    $('div#' + newTab).show();
    event.currentTarget.className += " active";
}

// allows user to drop letter back into the letter tray
function allowTrayDrop(event) {
    event.preventDefault();
}

function displayTie() {
    displayAlert("The game ended in a tie.", true);
    changeColors('#979797');
    $('.alert-content').css("border-color", "#979797");
    vm.result = "It's a tie."
}

function displayWin() {
    displayAlert("Congratulations, you win!", true);
    changeColors('#3ea572');
    vm.result = "You win!"
}

function displayLoss() {
    displayAlert("You lost.", false);
    changeColors('#f3634b');
    vm.result = "You lose."
}

function changeColors(color) {
    $('div#letterTray').css('background-color', color);
    $('button.gameOptions').css('border-color', color);
    $('table.gameBoard').css('border-color', color);
    $('.gameBoard td').css('border-color', color);
}

function displayAlert(message, isSuccess) {
    $('#alert-message').html(message);
    if(isSuccess) {
        $('.alert-content').css("border-color", "green");
    } else {
        $('.alert-content').css("border-color", "red");
    }
    $('#alertModal').fadeIn('fast');
    $('.input').hide();
}

function displayInput(message) {
    $('#alert-message').html(message);
    $('.alert-content').css("border-color", "green");
    $('#alertModal').fadeIn('fast');
    $('.input').show();
    $('#inputField').val("");
    $('#inputField').focus();
    $('#error').hide();
    $("#inputField").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            validateInput();
        }
    });
    $('#enter').click(function() {
        validateInput();
    });
}

function validateInput() {
    var text = $('#inputField').val();
    if (text == "") {
        $('#error').html("Please enter a name.");
        $('#error').fadeIn('fast');
    } else if(text.includes(' ')) {
        $('#error').html("Name cannot contain spaces.");
        $('#error').fadeIn('fast');
    } else {
        vm.changeName(text);
        $('#alertModal').fadeOut('fast');
    }
}

$('span.close').click(function() {
    $('#alertModal').fadeOut('fast');
});

$(window).click( function (event) {
    if (event.target.id == 'alertModal') {
        $('#alertModal').fadeOut('fast');
    }
}); 

