const log4js = require('log4js');
const express = require('express');
const line = require('@line/bot-sdk');
const mongojs = require('./mongojs');
log4js.configure('./config/log4js.json');
var log = log4js.getLogger("linejs");
var mongodb = require('./db');
var db = mongodb.connect;
const router = express.Router();

require('dotenv').config();

const app = express();

const config = {
channelAccessToken: '0SZ7tfczUhMtrFEm7g8SkGEAyVSc3jPa150UCv/jdnDZ9HP73u4lqhbyhfx2zKyI+H6Pk+WfpmJDCoosoG4rzd4NeIAMnIU1T8KCFFbA9G5cs4y7712KAuLfLWlbY2ZjJJCwK7K300pTz3iG9hzh6QdB04t89/1O/w1cDnyilFU=' ,
    channelSecret: 'cb06e6f58ae3814d63f528076c4bd15d'
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
      Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

function handleEvent(event) {
   log.info("event type:" + event.type);

   if (event.type === 'message' && event.message.type === 'text') { 
      handleMessageEvent(event);
    } else {
        return Promise.resolve(null);
    }
}

var displayName = "";
var pictureUrl = "";
function handleMessageEvent(event) {
    client.getProfile(event.source.userId)
       .then((profile) => {
      displayName = (profile.displayName);
      pictureUrl = (profile.pictureUrl);
      //console.log(profile.userId);
      //console.log(profile.statusMessage);
       })
       .catch((err) => {
      // error handling
     });
  
    log.debug("check line displayName= " +  displayName); 
    var msgdb = {
       userId: event.source.userId,
       displayName: displayName,
       pictureUrl: pictureUrl,
       startTime: '',
       endTime: '',
       agentName: '',
       session: '',
       timestamp: event.timestamp
    }
   
    var agentname = ''; 
    var query = { userId: event.source.userId };
    //update customer list 
    db.collection("customers").find(query).toArray(function(err, result){
      if (err) throw err;
       
      if(result.length==0){
        log.debug("add new lineid  " + event.source.userId);
        db.customers.insert(msgdb);
      } else{
        agentname = result[0].agentName;
      }	
    });

    //update line display name and pictureUrl
    if(displayName.length>0) { 
      var updatedisplay = { userId: event.source.userId };
      var newvalues = { $set: {displayName: displayName, pictureUrl: pictureUrl }};
      db.collection("customers").update(updatedisplay,newvalues, function(err, res) {
        if (err) throw err;

        log.debug("update display:" + displayName);
      });
    }

    var msgline = {
       userid: '',
       username: '',
       lineDisplayName: displayName,
       pictureUrl: pictureUrl,
       lineid: event.source.userId,
       message: event.message.text,
       agentname: agentname
    }

    var serverio = require('./serverchat');

    serverio.sendsocket(event.source.userId, msgline);
    log.debug(msgline); 
    //mongojs.sendPublish('agent_a', msg);
    //return client.replyMessage(event.replyToken, msg);
}

function pushMessageLine(to, msg) {
	const message = {
  		type: 'text',
  		text: msg
	};
	
	client.pushMessage(to, message)
  	.then(() => {
  	})
  	.catch((err) => {
       	});
}

module.exports = {
  startline : function() {
    app.set('port', (process.env.PORT || 3000));

    app.listen(app.get('port'), function () {
        console.log('run at port', app.get('port'));
    });
  },
  pushmessage : function(to, msg) {
    pushMessageLine(to, msg);
  }
}
