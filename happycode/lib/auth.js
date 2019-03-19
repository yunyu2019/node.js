var cryptos=require('./cryptos');
var redis=require('./redis');
var jwt = require('jsonwebtoken');
var auth={};

// 验证后台用户是否登录
auth.authUser = function (req,res,next) {
	var url=req.path;
	var excludes=['/user/login','/user/register'];
	var happy_user=req.cookies.happy_user;
	if(typeof(happy_user)=='undefined'){
		if(excludes.indexOf(url)>-1){
			next();
		}else{
			res.redirect('/user/login');
		}
	}else{
		var key=req.app.get('cookie_key');
		var iv=req.app.get('cookie_iv');
		try{
			var val=cryptos.decrypt(key,iv,happy_user);
			var user_info=JSON.parse(val);
			var user_flag=typeof(user_info)=='undefined' || typeof(user_info.happy)=='undefined' || user_info.happy!="admin" || typeof(user_info.email)=='undefined' || typeof(user_info.id)=='undefined' || typeof(user_info.name)=='undefined';
			if(user_flag){
				if(excludes.indexOf(url)>-1){
					next();
				}else{
					res.redirect('/user/login');
				}
			}else{
				res.locals.admin_user=user_info;
				next();
			}
		}catch(e){
			if(excludes.indexOf(url)>-1){
				next();
			}else{
				res.redirect('/user/login');
			}
		}
	}
};

//验证会员信息
auth.authMember=function(req,res,next){
	var msg={code:9,msg:""};
	var token=req.get('X-token');
	if(typeof(token)=='undefined' || token==''){
		msg.msg="请先登录";
		res.json(msg);
	}else{
		try{
			jwt.verify(token,'happycodev4_token',function(err,decoded){
				if(err){
					msg.msg="token error or token expires";
					res.json(msg);
					return;
				}
				res.locals.app_user=decoded.data;
				next();
			});
		}catch(e){
			msg.code=8;
			msg.msg="请先登录";
			res.json(msg);
		}
	}
};

module.exports=auth