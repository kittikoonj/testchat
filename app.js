var log4js = require('log4js');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var customers = require('./routes/customers');
var serverchat = require('./routes/serverchat');
var linejs = require('./routes/linejs');

log4js.configure('./config/log4js.json');
var log = log4js.getLogger("app");

// start node line 
linejs.startline();

// start socket io server
serverchat.startchat();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/*
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); 
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.render('index');
});
*/
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/customers', customers);
//app.use('/serverchat', serverchat);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', (process.env.PORT || 10000));
app.listen(app.get('port'), function () {
    log.info('start qts chat');
    log.info('run at port', app.get('port'));
});

module.exports = app;
