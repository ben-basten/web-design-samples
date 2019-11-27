var express = require("express");
var bodyParser = require("body-parser");
var app = express();

const port = 80;

//This is for preforming IO on files.
var fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));

var http = require("http");
var https = require("https");

// Getting an instance of a Node HTTP (web) server here.
var server = http.createServer(app);

//On command prompt, we need to do "npm install socket.io"
var socketio = require("socket.io");

//instantiates our 'io' instance, and also connects it up with the HTTP
//server we already created.
var io = socketio(server);

//Reads in the list of words and stores them all.
var text = fs.readFileSync("dictionary.txt", "utf-8");
//dictionary is an array where each element is a word from dictionary.txt
var dictionary = text.split(/\r?\n/g);

var letterpoints = { "A": 1, "B": 3, "C": 3, "D": 2, "E": 1, "F": 4, "G": 2, "H": 4, "I": 1, "J": 8, "K": 5, "L": 1, "M": 3, "N": 1, "O": 1, "P": 3, "Q": 10, "R": 1, "S": 1, "T": 1, "U": 1, "V": 4, "W": 4, "X": 8, "Y": 4, "Z": 10 };

class Error {
	constructor(text) {
		this.isError = true;
		this.errorMessage = text;
	}
}

class TileTrays {
	constructor() {
		this.bagOfTiles = { "A": 9, "B": 2, "C": 2, "D": 4, "E": 12, "F": 2, "G": 3, "H": 2, "I": 9, "J": 1, "K": 1, "L": 4, "M": 2, "N": 6, "O": 8, "P": 2, "Q": 1, "R": 6, "S": 4, "T": 6, "U": 4, "V": 2, "W": 2, "X": 1, "Y": 2, "Z": 1 };

		this.player1 = [];
		this.replaceTiles(true);

		this.player2 = [];
		this.replaceTiles(false);
	}

	numberOfRemainingLetters() {
		var count = 0;
		for (var letter in this.bagOfTiles) {
			count += this.bagOfTiles[letter];
		}
		return count;
	}

	//Refills tiletray as long as there are tiles left in the bag.
	replaceTiles(isPlayer1) {
		var tiletray;
        if(isPlayer1) {
            tiletray = this.player1;
        } else {
            tiletray = this.player2;
        }
        var tilesneeded = 7 - tiletray.length;
        for (var i = 1; i <= tilesneeded; i++) {
            var bagsize = 0;
            var numtiles = 0;
            for (var num in this.bagOfTiles) {
                bagsize++;
                numtiles = numtiles + this.bagOfTiles[num];
            }
            //Make sure there are tiles left in the bag.
            if (bagsize == 0) {
                if(isPlayer1) {
                    this.player1 = tiletray;
                } else {
                    this.player2 = tiletray;
                }
                return;
            } else {
                //Get a random index from the bag.
                var j = Math.floor(Math.random() * numtiles) + 1;
                var ct = 0;
                for (var letter in this.bagOfTiles) {
                    var numletter = this.bagOfTiles[letter];
                    if (ct + numletter >= j) {
                        //Add the tile to the tray.
                        tiletray.push(letter);
                        //Remove tile from the bag.
                        this.bagOfTiles[letter]--;
                        //Remove letter if there are no more of that letter in the bag.
                        if (this.bagOfTiles[letter] == 0) delete this.bagOfTiles[letter];
                        break;
                    }
                    else ct = ct + numletter;
                }
            }
		}
        if(isPlayer1) {
            this.player1 = tiletray;
        } else {
            this.player2 = tiletray;
        }
        return;
    }

	setPlayer1(tray){
		this.player1 = tray;
		this.replaceTiles(true);
	}

	setPlayer2(tray){
		this.player2 = tray;
		this.replaceTiles(false);
	}
}

class Square {
	constructor(letter, special, isNew) {
		this.letter = letter;
		this.special = special;
		this.isNew = isNew;
	}

	hasLetter() {
		return this.letter != null;
	}

	// checks if square should be styled as a special square
	isSpecial() {
		return this.special && !this.letter;
	}

	// checks if square should be styled as a played letter
	isExistingLetter() {
		return this.letter != null && !this.isNew;
	}

	// checks if square should be styled as a new letter just placed on the board
	isNewLetter() {
		return this.letter != null && this.isNew;
	}

	removeLetter() {
		this.letter = null;
		this.isNew = null;
	}
};

class GameBoard {
	constructor(board) {
		if (typeof board !== 'undefined') {
			this.board = board;
		} else {
			var size = 15;
			this.board = new Array(size);

			for (var i = 0; i < this.board.length; i++) {
				this.board[i] = new Array(size);
			}

			for (var row = 0; row < this.board.length; row++) {
				for (var col = 0; col < this.board[row].length; col++) {
					var middle = Math.floor(this.board.length / 2);
					var quarter = Math.floor(middle / 2);
					var maximum = this.board.length - 1;

					// setting triple word squares
					if ((row == 0 || row == middle || row == maximum) &&
						(col == 0 || col == middle || col == maximum) &&
						!(col == middle && row == middle)) {
						this.board[row][col] = new Square(null, 'TW', false);
					}

					// setting triple letter squares
					else if ((row == middle - 2 || row == middle + 2) &&
						(col == 1 || col == maximum - 1 || col == middle - 2 || col == middle + 2) ||
						(col == middle - 2 || col == middle + 2) &&
						(row == 1 || row == maximum - 1)) {
						this.board[row][col] = new Square(null, 'TL', false);
					}

					// setting double word squares
					else if ((row == col || (maximum - row) == col) &&
						(row > 0 && row < middle - 2 || row < maximum && row > middle + 2)) {
						this.board[row][col] = new Square(null, 'DW', false);
					}

					// setting double letter squares
					else if ((row == 0 || row == maximum) && (col == quarter || col == (maximum - quarter)) ||
						(col == 0 || col == maximum) && (row == quarter || row == (maximum - quarter)) ||
						(row == quarter || row == (maximum - quarter)) && (col == middle) ||
						(col == quarter || col == (maximum - quarter)) && (row == middle) ||
						(row == middle - 1 || row == middle + 1) && (col == middle - 1 || col == middle + 1) ||
						(row == quarter - 1 || row == (maximum - quarter + 1)) && (col == middle + 1 || col == middle - 1) ||
						(col == quarter - 1 || col == (maximum - quarter + 1)) && (row == middle + 1 || row == middle - 1)) {
						this.board[row][col] = new Square(null, 'DL', false);
					}

					// setting center
					else if (row == middle && col == middle) {
						this.board[row][col] = new Square(null, 'center', false);
					}

					// setting empty squares
					else {
						this.board[row][col] = new Square(null, null, false);
					}
				}
			}
		}
	}

	checkTilePositions() {
		var newLetters = 0;
		var firstRow, firstCol, isVertical, adjacentVertical, adjacentHorizontal;
		var middle = Math.floor(this.board.length / 2);

		for (var row = 0; row < this.board.length; row++) {
			for (var col = 0; col < this.board[row].length; col++) {
				var square = this.board[row][col];
				// getting position of first letter
				if (square.isNew && newLetters == 0) {
					firstRow = row;
					firstCol = col;
					newLetters++;
					// determining direction of word
				} else if (square.isNew && newLetters == 1) {
					newLetters++;
					if (col == firstCol) {
						isVertical = true;
						var isAdjacentLetters = this.checkBetween(isVertical, row, col, firstRow);
						if (!isAdjacentLetters) {
							return new Error("Invalid tile positions.");
						}
					} else if (row == firstRow) {
						isVertical = false;
						var isAdjacentLetters = this.checkBetween(isVertical, row, col, firstCol);
						if (!isAdjacentLetters) { 
							return new Error("Invalid tile positions.");
						}
					} else {
						return new Error("Invalid tile positions.");
					}
					// makes sure each successive letter is still going in the same direction
				} else if (square.isNew) {
					newLetters++;
					if (isVertical) {
						if (!(col == firstCol)) {
							return new Error("Invalid tile positions.");
						} 
						var isAdjacentLetters = this.checkBetween(isVertical, row, col, firstRow);
						if (!isAdjacentLetters) {
							return new Error("Invalid tile positions.");
						}
					} else {
						if (!(row == firstRow)) {
							return new Error("Invalid tile positions.");
						} 
						var isAdjacentLetters = this.checkBetween(isVertical, row, col, firstCol);
						if (!isAdjacentLetters) {
							return new Error("Invalid tile positions.");
						}
					}
				}
			}
		}
		if (newLetters == 0) {
			return new Error("Please place a tile on the board.");
		} 
		if(this.board[middle][middle].letter == null && game.numberOfTurns == 0) {
			return new Error("A tile must be placed in the center of the board for the first move.");
		}
		return true;
	}

	checkBetween(isVertical, row, col, firstIndex) {
		if (isVertical) {
			for (var i = row - 1; i > firstIndex; i--) {
				if (this.board[i][col].letter == null) {
					return false;
				}
			}
		} else {
			for (var i = col - 1; i > firstIndex; i--) {
				if (this.board[row][i].letter == null) {
					return false;
				}
			}
		}
		return true;
	}

	//Change new squares depending on if the move was valid.
	editValidBoard() {
		//If the move was valid change new to false.
		for (var i = 0; i < this.board.length; i++) {
			for (var j = 0; j < this.board[i].length; j++) {
				var square = this.board[i][j];
				if (square.isNew) {
					square.isNew = false;
					this.board[i].splice(j, 1, square);
				}
			}
		}
	}
}

class Game {
	constructor() {
		this.gameBoard = new GameBoard();

		this.player1Score = 0;
		this.player2Score = 0;

		this.player1 = "Player 1";
		this.player2 = "Player 2";

		this.player1Id = null;
		this.player2Id = null;

		this.player1Pass = false;
		this.player2Pass = false;

		// for socket.io
		this.roomId = null;

		this.isPlayer1Turn = true;

		this.numberOfTurns = 0;

		this.tileTrays = new TileTrays();

		this.remainingLetters = this.tileTrays.numberOfRemainingLetters();
	}

	getPlayerIds(){
		return {player1: this.player1Id, player2: this.player2Id};
	}

	getPlayerNames() {
		return {player1: this.player1, player2: this.player2};
	}

	getMove(word, points, pid){
		if (this.player1Id == pid && word != "") return this.player1 + " played '" + word + "' for " + points + " points.";
		else if (this.player2Id == pid && word != "") return this.player2 + " played '" + word + "' for " + points + " points.";
		else if (this.player1Id == pid && word == "") return this.player1 + " passed.";
		else if (this.player2Id == pid && word == "") return this.player2 + " passed.";
	}

	setScore(points, pid){
		if (this.player1Id == pid) this.player1Score = this.player1Score + points;
		else if (this.player2Id == pid) this.player2Score = this.player2Score + points;
	}

	setPass(pid){
		if (this.player1Id == pid) this.player1Pass = true;
		else if (this.player2Id == pid) this.player2Pass = true;
	}

	clearPass(){
		this.player1Pass = false;
		this.player2Pass = false;
	}

	gameWon(){
		if (this.player1Pass == true && this.player2Pass == true) return true;
		else if (this.tileTrays.player1.length == 0 || this.tileTrays.player2.length == 0) return true;
		else return false;
	}

	setGameBoard(gameBoard){
		this.gameBoard = gameBoard;
	}

	setPlayer(pid){
		if (this.player1Id == null) {
			this.player1Id = pid;
			return true;
		}
		else if (this.player2Id == null) {
			this.player2Id = pid;
			return true;
		}
		else return new Error("Sorry, the lobby is full. There are already 2 players.");
	}

	removePlayer(pid){
		if (this.player1Id == pid) this.player1Id = null;
		else if (this.player2Id == pid) this.player2Id = null;
	}

	swapTurn(){
		this.isPlayer1Turn = !this.isPlayer1Turn;
	}

	setNumTurns(){
		this.numberOfTurns++;
	}

	setTray(pid, tray){
		if (this.player1Id == pid) this.tileTrays.setPlayer1(tray);
		else if (this.player2Id == pid) this.tileTrays.setPlayer2(tray);
		this.remainingLetters = this.tileTrays.numberOfRemainingLetters();
	}

	declareWinner(){
		var p1points = this.player1Score;
		for(var letter of this.tileTrays.player1){
			p1points = p1points - letterpoints[letter];
		}
		var p2points = this.player2Score;
		for(var letter of this.tileTrays.player2){
			p2points = p2points - letterpoints[letter];
		}
		if (p1points > p2points) return {tie: false, playerOneWin: true, player1points: p1points, player2points: p2points};
		else if (p2points > p1points) return {tie: false, playerOneWin: false, player1points: p1points, player2points: p2points};
		else return {tie: true, playerOneWin: false, player1points: p1points, player2points: p2points};
	}

	getGameForPlayer(pid) {
		if (this.player1Id == pid){
			return {
				board: this.gameBoard,
				player1Score: this.player1Score,
				player2Score: this.player2Score,
				player1: this.player1,
				player2: this.player2,
				isMyTurn: this.isPlayer1Turn,
				remainingLetters: this.remainingLetters,
				playerTray: this.tileTrays.player1,
				whoAmI: this.player1
			};
		}
		else{
			return {
				board: this.gameBoard,
				player1Score: this.player1Score,
				player2Score: this.player2Score,
				player1: this.player1,
				player2: this.player2,
				isMyTurn: !this.isPlayer1Turn,
				remainingLetters: this.remainingLetters,
				playerTray: this.tileTrays.player2,
				whoAmI: this.player2
			};
		}
	}

	getRematch() {
		return {
			board: this.gameBoard,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			player1: this.player1,
			player2: this.player2,
			isMyTurn: this.isPlayer1Turn,
			remainingLetters: this.remainingLetters,
			player1Tray: this.tileTrays.player1,
			player2Tray: this.tileTrays.player2
		};
	}

	toJSON() {
		return {
			board: this.gameBoard.board,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			player1: this.player1,
			player2: this.player2,
			isPlayer1Turn: this.isPlayer1Turn,
			remainingLetters: this.remainingLetters,
			player1Tray: this.tileTrays.player1,
			player2Tray: this.tileTrays.player2
		}
	}

	sendMove(word, points, pid) {
		return {
			board: this.gameBoard,
			player1Score: this.player1Score,
			player2Score: this.player2Score,
			player1: this.player1,
			player2: this.player2,
			isPlayer1Turn: this.isPlayer1Turn,
			remainingLetters: this.remainingLetters,
			player1Tray: this.tileTrays.player1,
			player2Tray: this.tileTrays.player2,
			move: this.getMove(word, points, pid)
		}
	}

	changeName(playerId, newName) {
		if(this.player1Id == playerId) {
			this.player1 = newName;
			console.log("player one name " + this.player1);
		} else {
			this.player2 = newName;
			console.log("player two name " + this.player1);
		}
	}
}

var game = new Game();







function findNewWord(board, boardlength) {
	var letter1 = null;
	var letter2 = null;
	//Find the first two new letters to decide which direction the word is aligned.
	for (var i = 0; i < boardlength; i++) {
		for (var j = 0; j < boardlength; j++) {
			if (board[i][j].isNew && letter1 == null) {
				letter1 = { row: i, col: j };
			}
			else if (board[i][j].isNew && letter2 == null) {
				letter2 = { row: i, col: j };
				//The word is vertical.
				if (letter1.row < letter2.row) {
					return {row: letter1.row, col: letter1.col, horizontal: false};
				}
				//The word is horizontal.
				else return { row: letter1.row, col: letter1.col, horizontal: true };
			}
		}
	}
	//In case they only placed 1 new tile on a word.
	if ((letter1.row != 0 && letter1.row != board.length - 1) && (board[letter1.row + 1][letter1.col].letter != null || board[letter1.row - 1][letter1.col].letter != null)) {
		return { row: letter1.row, col: letter1.col, horizontal: false };
	}
	else if (letter1.row == board.length - 1 && board[letter1.row - 1][letter1.col].letter != null) {
		return { row: letter1.row, col: letter1.col, horizontal: false };
	}
	else if (letter1.row == 0 && board[letter1.row + 1][letter1.col].letter != null) {
		return { row: letter1.row, col: letter1.col, horizontal: false };
	}
	else return { row: letter1.row, col: letter1.col, horizontal: true };
}

//Get the points for the letter on the square.
function getPointsForSquare(square, letterpoints) {
	var points = 0;
	if (square.special == "DL") {
		var p = letterpoints[square.letter] * 2;
		points = points + p;
	}
	else if (square.special == "TL") {
		var p = letterpoints[square.letter] * 3;
		points = points + p;
	}
	else points = points + letterpoints[square.letter];
	return points;
}

function buildWordAndPoints(board, letterpoints, horizontal, x, y, boardlength) {
	var firstletterx = x;
	var firstlettery = y;
	var word = "";
	var wordpoints = 0;
	var double = false;
	var triple = false;
	if (horizontal == true) {
		//Start putting each letter into a string.
		for (var i = firstletterx; i < boardlength; i++) {
			if (board[firstlettery][i].letter != null) {
				//Add the letter to the word.
				word = word + board[firstlettery][i].letter;
				//Add the points for that letter to word points.
				wordpoints = wordpoints + getPointsForSquare(board[firstlettery][i], letterpoints);
				//Check if it's double word or triple word.
				if (board[firstlettery][i].special == "DW") double = true;
				else if (board[firstlettery][i].special == "TW") triple = true;
			}
			else break;
		}
	}
	else {
		//Start putting each letter into a string.
		for (var i = firstlettery; i < boardlength; i++) {
			if (board[i][firstletterx].letter != null) {
				//Add the letter to the word.
				word = word + board[i][firstletterx].letter;
				//Add the points for that letter to word points.
				wordpoints = wordpoints + getPointsForSquare(board[i][firstletterx], letterpoints);
				//Check if it's double word or triple word.
				if (board[i][firstletterx].special == "DW") double = true;
				else if (board[i][firstletterx].special == "TW") triple = true;
			}
			else break;
		}
	}
	word = word.toLowerCase();
	return { w: word, p: wordpoints, d: double, t: triple };
}

//Check new adjacent words.
function checkAdjacent(board, dictionary, letterpoints, horizontal, x, y, boardlength) {
	var firstletterx = x;
	var firstlettery = y;
	var word = "";
	var wordpoints = 0;
	if (horizontal == true) {
		//Find if there is a letter to the left.
		if (firstletterx != 0 && board[firstlettery][firstletterx - 1].letter != null) {
			while (firstletterx > 0) {
				if (board[firstlettery][firstletterx - 1].letter != null) firstletterx--;
				else break;
			}
		}
		var w = buildWordAndPoints(board, letterpoints, horizontal, firstletterx, firstlettery, boardlength);
		wordpoints = w.p;
		word = w.w;
		if (w.t == true) wordpoints = wordpoints * 3;
		else if (w.d == true) wordpoints = wordpoints * 2;

		//It's valid.
		if (dictionary.indexOf(word) >= 0) return { valid: true, p: wordpoints };
		else return { valid: false, p: 0 };
	}
	else {
		//Find if there is a letter to the left.
		if (firstlettery != 0 && board[firstlettery - 1][firstletterx].letter != null){
			while (firstlettery > 0){
				if (board[firstlettery - 1][firstletterx].letter != null) firstlettery--;
				else break;
			}
		}
		var w = buildWordAndPoints(board, letterpoints, horizontal, firstletterx, firstlettery, boardlength);
		wordpoints = w.p;
		word = w.w;
		if (w.t == true) wordpoints = wordpoints * 3;
		else if (w.d == true) wordpoints = wordpoints * 2;

		//It's valid.
		if (dictionary.indexOf(word) >= 0) return { valid: true, p: wordpoints };
		else return { valid: false, p: 0 };
	}
}

function checkNeighbors(board, dictionary, letterpoints, horizontal, firstletterx, firstlettery, boardlength, i) {
	var turnpoints = 0;
	if (horizontal == true){
		if (firstlettery == 0){
			if (board[i][firstlettery + 1].letter != null){
				var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, i, firstlettery, boardlength);
				if (w.valid == true) turnpoints = turnpoints + w.p;
				else return { valid: false, p: turnpoints };
			}
		}
		else if (firstlettery == boardlength - 1){
			if (board[i][firstlettery - 1].letter != null){
				var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, i, firstlettery, boardlength);
				if (w.valid == true) turnpoints = turnpoints + w.p;
				else return { valid: false, p: turnpoints };
			}
		}
		else if (board[firstlettery - 1][i].letter != null || board[firstlettery + 1][i].letter != null){
			var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, i, firstlettery, boardlength);
			if (w.valid == true) turnpoints = turnpoints + w.p;
			else return { valid: false, p: 0 };
		}
	}
	//It's vertical.
	else{
		if (firstletterx == 0){
			if (board[i][firstletterx + 1].letter != null){
				var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, firstletterx, i, boardlength);
				if (w.valid == true) turnpoints = turnpoints + w.p;
				else return { valid: false, p: turnpoints };
			}
		}
		else if (firstletterx == boardlength - 1){
			if (board[i][firstletterx - 1].letter != null){
				var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, firstletterx, i, boardlength);
				if (w.valid == true) turnpoints = turnpoints + w.p;
				else return { valid: false, p: turnpoints };
			}
		}
		else if (board[i][firstletterx - 1].letter != null || board[i][firstletterx + 1].letter != null){
			var w = checkAdjacent(board, dictionary, letterpoints, !horizontal, firstletterx, i, boardlength);
			if (w.valid == true) turnpoints = turnpoints + w.p;
			else return { valid: false, p: 0 };
		}
	}
	return { valid: true, p: turnpoints };
}

//Check if the new word is valid along with any other new words created by it and the total points.
function isValidWord(board, dictionary, letterpoints) {
	var boardlength = board.length;
	var newword = findNewWord(board, boardlength);
	var firstletterx = newword.col;
	var firstlettery = newword.row;
	var horizontal = newword.horizontal;
	var word = "";
	var turnpoints = 0;
	var wordpoints = 0;
	if (horizontal == true) {
		if (firstletterx != 0) {
			//Find the first letter of the word even if it was already there.
			while (firstletterx > 0) {
				if (board[firstlettery][firstletterx - 1].letter != null) firstletterx--;
				else break;
			}
		}
		var w = buildWordAndPoints(board, letterpoints, horizontal, firstletterx, firstlettery, boardlength);
		wordpoints = w.p;
		word = w.w;
		if (w.t == true) wordpoints = wordpoints * 3;
		else if (w.d == true) wordpoints = wordpoints * 2;
		turnpoints = wordpoints;

		//It's valid.
		if (dictionary.indexOf(word) >= 0) {
			//Check both sides of each new letter for other new words and check if they're valid.
			for (var i = firstletterx; i < boardlength; i++) {
				//Only check if the letter is new, old words don't matter.
				if (board[firstlettery][i].letter != null && board[firstlettery][i].isNew == true){
					//Check vertically since the original word was horizontal.
					var w = checkNeighbors(board, dictionary, letterpoints, horizontal, firstletterx, firstlettery, boardlength, i);
					if (w.valid == true) turnpoints = turnpoints + w.p;
					else return { valid: false, p: 0 };
				}
				else if (board[firstlettery][i].letter != null && board[firstlettery][i].isNew == false) continue;
				else break;
			}
			return { valid: true, p: turnpoints, w: word };
		}
		//It's not valid.
		else return { valid: false, p: 0 };
	}
	//It's vertically aligned.
	else {
		if (firstlettery != 0) {
			//Find the first letter of the word even if it was already there.
			while (firstlettery > 0) {
				if (board[firstlettery - 1][firstletterx].letter != null) firstlettery--;
				else break;
			}
		}
		var w = buildWordAndPoints(board, letterpoints, horizontal, firstletterx, firstlettery, boardlength);
		wordpoints = w.p;
		word = w.w;
		if (w.t == true) wordpoints = wordpoints * 3;
		else if (w.d == true) wordpoints = wordpoints * 2;
		turnpoints = wordpoints;

		//It's valid.
		if (dictionary.indexOf(word) >= 0) {
			//Check both sides of each new letter for other new words and check if they're valid.
			for (var i = firstlettery; i < boardlength; i++){
				//Only check if the letter is new, old words don't matter.
				if (board[i][firstletterx].letter != null && board[i][firstletterx].isNew == true){
					//Check horizontally since the original word was horizontal.
					var w = checkNeighbors(board, dictionary, letterpoints, horizontal, firstletterx, firstlettery, boardlength, i);
					if (w.valid == true) turnpoints = turnpoints + w.p;
					else return { valid: false, p: turnpoints };
				}
				else if (board[i][firstletterx].letter != null && board[i][firstletterx].isNew == false) continue;
				else break;
			}
			return { valid: true, p: turnpoints, w: word };
		}
		//It's not valid.
		else return { valid: false, p: 0 };
	}
}

io.on("connection", function (socket) {
	var gameToSend = game.setPlayer(socket.id);
	if (!gameToSend.isError) gameToSend = game.getGameForPlayer(socket.id);
	socket.emit("getGame", gameToSend);

	socket.on("playMove", function (dataFromClient) {
		var gameboard = dataFromClient.board;
		var tiletray = dataFromClient.tray;

		var newBoard = new GameBoard(gameboard);

		// result will contain the data that gets sent back to the client
		var result = newBoard.checkTilePositions();
		if (!result.isError) {
			var isValid = isValidWord(gameboard, dictionary, letterpoints);
			if (isValid.valid) {
				newBoard.editValidBoard();
				game.setGameBoard(newBoard);
				game.setTray(socket.id, tiletray);
				game.setScore(isValid.p, socket.id);
				game.swapTurn();
				game.setNumTurns();
				game.clearPass();
				result = {
					isError: false,
					gameState: game.sendMove(isValid.w, isValid.p, socket.id)
				};
				// console.log(result.gameState.player1Tray);
				io.emit("playMove", result);
			} else {
				result = new Error("Invalid word. Please try again.");
				socket.emit("playMove", result);
			}
		} else {
			socket.emit("playMove", result);
		}
		if (game.gameWon() == true) io.emit("gameOver", game.declareWinner());
	});

	socket.on("passMove", function (dataFromClient) {
		game.setNumTurns();
		game.setPass(socket.id);
		game.swapTurn();
		var result = {
			isError: false,
			gameState: game.sendMove("", 0, socket.id)
		};
		io.emit("playMove", result);
		if (game.gameWon() == true) io.emit("gameOver", game.declareWinner());
	});

	socket.on("changeName", function(data, callback) {
		game.changeName(socket.id, data.name);
		io.emit("updateNames", game.getPlayerNames());
	});

	socket.on("rematch", function (dataFromClient) {
		var pids = game.getPlayerIds();
		game = new Game();
		var otherId;
		if(socket.id == pids.player1) {
			game.setPlayer(pids.player1);
			otherId = pids.player2;
		} else {
			game.setPlayer(pids.player2);
			otherId = pids.player1;
		}
		game.setPlayer(otherId);
		var player1Game = game.getGameForPlayer(socket.id);
		var player2Game = game.getGameForPlayer(otherId);
		socket.emit("getGame", player1Game);
		socket.broadcast.emit("getGame", player2Game);
		// io.emit("rematch", gameToSend);
	});

	socket.on("disconnect", function () {
		game.removePlayer(socket.id);
	});
});

//Just for static files (like usual).  Eg. index.html, client.js, etc.
app.use(express.static(__dirname + "/pub"));

server.listen(port, function() {
	console.log("Server is listening on port " + port);
});