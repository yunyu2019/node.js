var nodemailer = require('nodemailer');
var configem = require('../config/web');
var sendEmail={};
var emailConfig = configem.email;

sendEmail.transporter = function () {
	var options={};
	if (emailConfig.sendService!='') {
		options['service']=emailConfig.sendService
	}else{
		options['host']=emailConfig.host;
		options['port']=emailConfig.port;
		options['secure']=emailConfig.secure;
	}
	options['debug']=emailConfig.debug;
	options['auth']={
		user: emailConfig.sendMailer,
		pass: emailConfig.sendMailPass
	};
	var transporter = nodemailer.createTransport(options,{
		from:'happycode <'+emailConfig.sendMailer+'>',
	});
	return transporter;
};

sendEmail.mailOptions = function (toEmail,htmlObj) {
	var mailOptions = {
		to: toEmail, 
		subject: '验证码',
		html:htmlObj
	};
	return mailOptions;
};
module.exports=sendEmail