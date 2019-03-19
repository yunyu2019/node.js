var express = require('express');
var bcrypt = require('bcryptjs');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var redis=require('../lib/redis');
var jwt = require('jsonwebtoken');
var validator    = require('validator');
var nodemailer = require('nodemailer');
var strings=require('../lib/string');
var sendMailObj=require('../lib/sendMailer');
var models = require('../models/index');
var router = express.Router();

//会员登录
router.post('/login',function(req, res, next) {
	var email=req.body['User[email]'];
	var pass=req.body['User[pwd]'];
	var msg={code:0,msg:"",data:null};
	if(typeof(email)=='undefined' || typeof(pass)=='undefined' || email=='' || pass==''){
		msg.code=1;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	email=validator.trim(email);
	pass=validator.trim(pass);
	var email_flag=validator.isEmail(email);
	var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
	var pass_flag=validator.matches(pass,pattern);
	if(!email_flag || !pass_flag){
		msg.code=2;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	redis.hget('onlines',email,function(err,reply){
		if(err){
			logs.error(err,req,res);
			msg.code=3;
			msg.msg='未知错误';
			res.json(msg);
			return;
		}
		if(reply){
			msg.code=4;
			msg.msg="已经登陆";
			res.json(msg);
			return;
		}
		var member=models.Member;
		member.findOne({attributes: ['id','nicename','email','pwd','last_time'],where:{email:email,status:true}})
		.then(function(result){
			if(result){
				bcrypt.compare(pass,result.pwd,function(err,flag){
					if(err){
						logs.error(err,req,res);
						msg.code=5;
						msg.msg='未知错误';
						res.json(msg);
						return;
					}
					if(flag){
						var last_time=result.last_time,nicename=result.nicename,email=result.email,user_id=result.id,current=Date.now();
						result.update({last_time:current})
						.then(function(){
							var expires_at=Date.now();
							var value={happy:"app",email:email,id:user_id,nicename:nicename,timestamp:expires_at};
							var token=jwt.sign({data:value},'happycodev4_token',{expiresIn:'24h'});
							redis.hset('onlines',email,token);
							redis.zadd('onlines_expires',expires_at,email);
							msg.msg='success';
							msg.data={nicename:nicename,email:email,last_time:last_time};
							res.set('X-token',token).json(msg);
							return;
						}).catch(function(err){
							logs.error(err,req,res);
							msg.msg="未知错误";
							msg.code=6;
							res.json(msg);
							return;
						});
					}else{
						msg.code=7;
						msg.msg='帐号或者密码错误';
						res.json(msg);
						return;
					}
				});
			}else{
				msg.msg='帐号或者密码错误';
				msg.code=8;
				res.json(msg);
			}
		}).catch(function(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='未知错误';
			res.json(msg);
		});
	});
});

//会员注册
router.post('/register',function(req, res, next){
	var email=req.body['User[email]'];
	var pass=req.body['User[pwd]'];
	var nicename=req.body['User[nicename]'];
	var msg={code:0,msg:"",data:null};
	if (typeof(email)=='undefined' || typeof(pass)=='undefined' || typeof(nicename)=='undefined' || email=='' || pass=='' || nicename=='') {
		msg.code=1;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	email=validator.trim(email);
	pass=validator.trim(pass);
	nicename=validator.trim(nicename);
	var email_flag=validator.isEmail(email);
	var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
	var pass_flag=validator.matches(pass,pattern);
	if(!email_flag || !pass_flag){
		msg.code=2;
		msg.msg="帐号或者密码格式错误";
		res.json(msg);
		return;
	}
	if(nicename.length<1 || nicename.length>20){
		msg.code=3;
		msg.msg="昵称格式错误";
		res.json(msg);
		return;
	}
	nicename=validator.escape(nicename);
	redis.sismember('emails',email,function(err,reply){
		if(reply){
			msg.code=4;
			msg.msg="邮箱已存在";
			res.json(msg);
		}else{
			var member=models.Member;
			bcrypt.genSalt(10, function(err, salt) {
				bcrypt.hash(pass, salt, function(err, hash) {
					if(err){
						logs.error(err,req,res);
						msg.code=5;
						msg.msg='未知错误';
						res.json(msg);
						return;
					}
					member.create({nicename:nicename,email:email,pwd:hash})
					.then(function(result) {
						redis.sadd('emails',email);
						msg.msg='success';
						res.json(msg);
						return;
					}).catch(function(err) {
						logs.error(err,req,res);
						msg.code=6;
						msg.msg='未知错误';
						res.json(msg);
					});
				});
			});
		}
	});
});

//检查邮箱唯一性
router.post('/check', function(req, res, next) {
	var email=req.body['User[email]'];
	var msg={code:0,msg:""};
	if(typeof(email)=='undefined' || email==''){
		msg.code=1;
		msg.msg="邮箱格式错误";
		res.json(msg);
		return;
	}
	email=validator.trim(email);
	if(validator.isEmail(email)==false){
		msg.code=2;
		msg.msg="邮箱格式错误";
		res.json(msg);
	}else{
		redis.sismember('emails',email,function(err,flag){
			if(flag){
				msg.code=3;
				msg.msg="邮箱已存在";
			}else{
				msg.msg="success";
			}
			res.json(msg);
		});
	}
});

//重置密码
router.post('/setpass', function(req, res, next) {
	var msg={code:0,msg:""};
	var email_token = req.signedCookies.email_token;
	if(typeof(email_token)=='undefined' || email_token=='' ||email_token==false){
		msg.code=1;
		msg.msg="用户信息丢失,请重新获取密钥串";
		res.json(msg);
		return;
	}
	var token_obj=JSON.parse(email_token);
	if(typeof(token_obj.captcha)=='undefined'){
		msg.code=2;
		msg.msg="用户信息丢失,请重新获取密钥串";
		res.json(msg);
		return;
	}
	var pass=req.body['User[pwd]'];
	var repass=req.body['User[repwd]'];
	pass=validator.trim(pass);
	repass=validator.trim(repass);
	var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
	var pass_flag=validator.matches(pass,pattern);
	if(!pass_flag){
		msg.code=3;
		msg.msg="密码格式不正确";
		res.json(msg);
		return;
	}
	var email=token_obj.email;
	redis.sismember('emails',email,function(err,reply){
		if(!reply){
			msg.code=4;
			msg.msg="邮箱帐号有问题";
			res.json(msg);
			return;
		}
		redis.hdel('token',email);
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(pass,salt);
		var member=models.Member;
		bcrypt.genSalt(10, function(err, salt) {
			bcrypt.hash(pass, salt, function(err, hash) {
				if(err){
					logs.error(err,req,res);
					msg.code=5;
					msg.msg='未知错误';
					res.json(msg);
					return;
				}
				member.update({pwd:hash},{where:{email:email,status:true}}).then(function(result){
					res.clearCookie('email_token');
					msg.msg='success';
					res.json(msg);
					return;
				}).catch(function(err){
					logs.error(err,req,res);
					msg.code=6;
					msg.msg="未知错误";
					res.json(msg);
					return;
				});
			});
		});
	});
});

//发送token
router.post('/token', function(req, res, next) {
	var msg={code:0,msg:""};
	var email=req.body['User[email]'];
	if(typeof(email)=='undefined' || email==''){
		msg.code=1;
		msg.msg="邮箱格式错误";
		res.json(msg);
		return;
	}
	email=validator.trim(email);
	var email_flag=validator.isEmail(email);
	var tokenTime = req.app.get('token');
	if(!email_flag){
		msg.code=2;
		msg.msg="邮箱格式错误";
		res.json(msg);
		return;
	}
	redis.sismember('emails',email,function(err,reply){
		if(!reply){
			msg.code=3;
			msg.msg="邮箱帐号有问题";
			res.json(msg);
			return;
		}
		redis.hget('token', email, function(rserr, rsres){
			if(rsres){
				var arr = JSON.parse(rsres);
				var now=Date.now();
				if(now-arr.created<tokenTime){
					msg.code=0;
					msg.msg="邮箱中的密钥还可用,请不要重复请求";
					res.json(msg);
					return;
				}
				var captcha = strings.createCode(6);
				var info = {captcha:captcha,created:Date.now()};
				var info_str=JSON.stringify(info);
				redis.hset('token',email, info_str, function(rderr,rdres){
					if(rderr){
						msg.code=4;
						msg.msg="验证码写入失败";
						res.json(msg);
						return;
					}
					var htmlObj = '您本次请求的6位验证码是: <font style="color:red;">'+captcha+'</font> ,'+tokenTime/60000+'分钟内有效,请不要回复该邮件';
					var transporter = sendMailObj.transporter();
					var mailOptions = sendMailObj.mailOptions(email,htmlObj);
					transporter.sendMail(mailOptions,function(err, info_str) {
						if (err) {
							logs.error(err,req,res);
							transporter.close();
							msg.code=5;
							msg.msg="邮件发送失败";
							res.json(msg);
							return;
						}
						transporter.close();
						var email_obj={email:email};
						var email_token=JSON.stringify(email_obj);
						res.cookie('email_token',email_token,{path:'/api',maxAge:tokenTime,signed:true});
						msg.code=0;
						msg.msg="邮件发送成功";
						res.json(msg);
						return;
					});
				});
			}else{
				var captcha = strings.createCode(6);
				var info = {captcha:captcha,created:Date.now()};
				var info_str=JSON.stringify(info);
				redis.hset('token',email, info_str, function(rderr,rdres){
					if(rderr){
						msg.code=4;
						msg.msg="验证码写入失败";
						res.json(msg);
						return;
					}
					var htmlObj = '您本次请求的6位验证码是: <font style="color:red;">'+captcha+'</font> ,'+tokenTime/60000+'分钟内有效,请不要回复该邮件';
					var transporter = sendMailObj.transporter();
					var mailOptions = sendMailObj.mailOptions(email,htmlObj);
					transporter.sendMail(mailOptions, function (err, info_str) {
						if (err) {
							logs.error(err,req,res);
							transporter.close();
							redis.hdel('token',email);
							msg.code=5;
							msg.msg="邮件发送失败";
							res.json(msg);
							return;
						}
						transporter.close();
						var email_obj={email:email};
						var email_token=JSON.stringify(email_obj);
						msg.code=0;
						msg.msg="邮件发送成功";
						res.cookie('email_token',email_token,{path:'/api',maxAge:tokenTime,signed:true});
						res.json(msg);
						return;
					});
				});
			}
		});
	});
});

//验证密钥
router.post('/captcha',function(req,res,next){
	var msg={code:0,msg:""};
	var tokenTime = req.app.get('token');
	var token=req.body['User[token]'];
	var email_token = req.signedCookies.email_token;
	token=validator.trim(token);
	if(typeof(email_token)=='undefined' || email_token=='' || email_token==false){
		msg.code=1;
		msg.msg="用户信息丢失,请重新获取密钥串";
		res.json(msg);
		return;
	}
	var token_obj=JSON.parse(email_token);
	var email=token_obj.email;
	redis.hget('token',email, function(rserr,rsres){
		if(rsres){
			var arr = JSON.parse(rsres);
			if(arr.captcha != token){
				msg.code=7;
				msg.msg="密钥不正确";
				res.json(msg);
				return;
			}
			if(Date.now()-arr.created>tokenTime){
				msg.code=8;
				msg.msg="密钥已过期,请重新获取";
				redis.hdel('token',email);
				res.json(msg);
				return;
			}
			msg.msg="success";
			token_obj['captcha']=token;
			var email_token_str=JSON.stringify(token_obj);
		    res.cookie('email_token',email_token_str,{path:'/api',maxAge:tokenTime,signed:true});
			res.json(msg);
			return;
		}else{
			msg.code=9;
			msg.msg="密钥不存在,请重新获取";
			res.json(msg);
			return;
		}
	});
});

//修改密码
router.post('/editpass',auth.authMember,function(req, res, next) {
	var login_info=res.locals.app_user;
	var msg={code:0,msg:""};
	var oldpass=req.body['User[oldpwd]'];
	var pass=req.body['User[pwd]'];
	if(typeof(oldpass)=='undefined' || typeof(pass)=='undefined' || oldpass=='' || pass==''){
		msg.code=1;
		msg.msg="密码格式错误";
		res.json(msg);
		return;
	}
	oldpass=validator.trim(oldpass);
	pass=validator.trim(pass);
	var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
	var oldpass_flag=validator.matches(oldpass,pattern);
	var pass_flag=validator.matches(pass,pattern);
	if(!oldpass_flag || !pass_flag){
		msg.code=2;
		msg.msg="密码格式错误";
		res.json(msg);
		return;
	}
	var mem_id=login_info.id;
	var member=models.Member;
	member.findOne({where:{id:mem_id},attributes:['id','status','pwd']}).then(function(result){
		if(result && result.status==1){
			var flag=bcrypt.compareSync(oldpass,result.pwd);
			if(flag){
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(pass,salt);
				result.pwd=hash;
				result.save().then(function(){
					msg.msg='success';
					res.json(msg);
					return;
				}).catch(function(err){
					logs.error(err,req,res);
					msg.code=3;
					msg.msg="未知错误";
					res.json(msg);
					return;
				});
			}else{
				msg.msg='旧密码错误';
				msg.code=4;
				res.json(msg);
				return;
			}
		}else{
			msg.code=5;
			msg.msg="未知错误";
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=6;
		msg.msg="未知错误";
		res.json(msg);
		return;
	});
});

//会员登出
router.post('/logout',auth.authMember,function(req,res,next){
	var login_info=res.locals.app_user;
	redis.hdel('onlines',login_info.email);
	var msg={code:0,msg:"success"};
	res.json(msg);
});
module.exports=router
