var log4js = require('log4js');
var express = require('express');
var app = express();
var path = require('path');
var linejs = require('./linejs');

var port = 10001;
var io ;
var clients = {};

log4js.configure('./config/log4js.json');
var log = log4js.getLogger("serverchat");

function startchat() {
	var server = app.listen(port, function() {
	    log.info('Listening on port: ' + port + ' ');
	});

	io = require('socket.io').listen(server);

	app.set('views', '/opt/qim/views');
	app.set('view engine', 'jade'); 
	app.use(express.static('public'));

	app.get('/', function(req, res) {
		res.render('index');
	});

	io.on('connection', function(socket) {
		socket.on('chat', function(data) {
				io.emit('chat', data);
		});

		socket.on('chatline', function(data) {
			//sendmessage("chat", data);
			//send message to line
			io.emit('chatline', data);            
			linejs.pushmessage(data.userid,data.message);
		});
		
	socket.on('add-user', function(data){
            log.info("add user " + data.username);
	    clients[data.username] = {
	      "socket": socket.id
	    };
	  });

	  socket.on('private-message', function(data){
	    log.info("Sending: " + data.text + " to " + data.username + ", " + data);
	    if (clients[data.username]){
	      io.sockets.connected[clients[data.username].socket].emit("add-message", data);
	    } else {
	      log.info("User does not exist: " + data.username); 
	    }
	  });

	  //Removing the socket on disconnect
	  socket.on('disconnect', function() {
	  	for(var name in clients) {
	  		if(clients[name].socket === socket.id) {
	  			delete clients[name];
	  			break;
	  		}
	  	}	
	  })
	});
}

function sendmessage(to, msg) {
  var io = require('socket.io-client');
  var socket = io.connect('http://35.200.233.36:10001', {reconnect: true});

  socket.on('connect', function (socket) {
    log.info('Connected!');
  });

  //socket.emit('chat', msg);
  socket.emit('private-message', msg);
}

module.exports = {
  startchat : function() {
     startchat();
  },
  sendsocket : function(to, msg) {
    sendmessage(to,msg);
  }
}