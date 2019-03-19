var express = require('express');
var compression = require('compression');
var expressLayouts = require('express-ejs-layouts');
var expressControllers = require('express-controller');
var path = require('path');
var timeout = require('connect-timeout');
//var favicon = require('serve-favicon');
var logs = require('./lib/logs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var api=require('./api');
var app = express();
app.use(timeout('3s'));
var router = express.Router();
app.set('trust proxy','loopback');
app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('cookie_key','751f621ea5c8f930');
app.set('cookie_iv','2624750004598718');
app.set('token', 600000);
app.use(haltOnTimedout);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false,limit:'4096kb'}));
app.use(cookieParser('happy_code_version_4'));
//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(haltOnTimedout);
app.use(logs.request);
app.use('/',router);
app.use('/api',api);
function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  var status=err.status || 500;
  if(status>=500){
    logs.error(err,req,res);
  }
  next();
});

//绑定控制器
expressControllers
	.setDirectory( __dirname + '/controllers')
	.bind(router);
module.exports = app;
