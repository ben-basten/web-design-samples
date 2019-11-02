//This part is the same as usual...
var express = require("express");
var app = express();

var http = require("http");

//We are getting an instance of a Node HTTP (web) server here.
//We are also telling it to connect up with our Express application,
//so it can handle requests.
var server = http.Server(app);

//On command prompt, we need to do "npm install socket.io"
var socketio = require("socket.io");

var gameRooms = 0;

//instantiates our 'io' instance, and also connects it up with the HTTP
//server we already created.
var io = socketio(server);

io.on("connection", function(socket) {
	console.log("Somebody connected.");

	socket.on('create', function() {
		var id = createId();
		gameRooms++;
		socket.join(id);
        socket.emit('newGame', { room: id });
	});

	socket.on('join', function (data) {
		if (data.room != "") {
			var room = io.nsps['/'].adapter.rooms[data.room];
			if (room && room.length === 1) {
				socket.join(data.room);
				socket.to(data.room).emit('player1', { room: data.room});
				socket.emit('player2', { room: data.room });
				io.in(data.room).emit('startCountdown');
			} else if (!room && data.onLoad){
				return;
			} else if (!room) {
				socket.emit('newError', { error: "Room ID does not exist." });
			} else if (room.length == 2) {
				socket.emit('newError', { error: "Room is full!" });
			}
		}
	});

	socket.on('leave', function(data){
		socket.leave(data.room);
		socket.to(data.room).emit('newGame', {room: data.room});
	});

	socket.on('cancel', function(data) {
		socket.leave(data.room);
	});

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});

	socket.on('disconnecting', function(){
		var rooms = Object.keys(socket.rooms);
		// client is only ever in 1 room at a time, so rooms[1] will always be the room
		var currentRoom = rooms[1];
		if(typeof currentRoom != "undefined"){
			socket.to(currentRoom).emit('newGame', {room: currentRoom});
		}
	});

	//Replace 'eventNameHere' with whatever name you wish:
	socket.on("positionChange", function(data) {
		socket.to(data.room).emit('updatePosition', {position: data.position});
	});

	socket.on("reset", function(data){
		socket.to(data.room).emit('resetGame');
		io.in(data.room).emit('startCountdown');
	});
});

function createId() {
	var id = gameRooms;
	var characters = 'abcdefghijkmnpqrstuvwxyz';
	for(var i = 0; i < 4; i++) {
		id += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	console.log(id);
	return id;
}

//Just for static files (like usual).  Eg. index.html, client.js, etc.
app.use(express.static(__dirname + "/pub"));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/pub/tug.html');
});

server.listen(80, function() {
	console.log("Server is listening on port 80");
});



