var logger = require('./logger');
var log={};

log.request=function (req, res, next) {
	var t = new Date(),agent=req.get('User-Agent'),reffer=req.get('Referer');
	if(typeof(reffer)=='undefined') reffer='#';
	if(typeof(agent)=='undefined') agent='#';
	var message=req.method+' - '+req.url+' - '+req.ip+' - '+reffer+' - '+agent;
	res.on('finish', function () {
		var duration = ((new Date()) - t);
		message=message+' '+res.statusCode+' ('+duration + 'ms)';
		logger.access.info(message);
	});
	next();
};

log.error=function (err,req,res) {
	var status=err.status || 500;
	var message=req.method+' '+req.originalUrl+' '+req.ip+' '+status;
	if(err.stack){
		message=message+' '+err.stack;
	}else{
		message=message+' '+err.message;
	}
	logger.errors.error(message);
};
module.exports = log