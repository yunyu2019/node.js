var redis=require('../lib/redis');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var validator = require('validator');
var models=require('../models/index');

module.exports={
	get_index:[auth.authUser,function(req,res){
		redis.get('happy_code',function(err,replay){
			if(err){
				logs.error(err,req,res);
				var msg={code:9,msg:'error',data:null};
				res.json(msg);
				return;
			}
			var data={};
			if(replay){
				data=JSON.parse(replay);
			}
			res.render('config',{title:"系统设置",data:data});
		});
	}],

	post_save:[auth.authUser,function(req,res){
		var msg={code:0,msg:'',data:null};
		var version=req.body['Config[version]'];
		var pagesize=req.body['Config[pagesize]'];
		var email=req.body['Config[email]'];
		var emailpass=req.body['Config[emailpass]'];
		if (typeof(version)=='undefined' || typeof(pagesize)=='undefined'|| typeof(email)=='undefined' || typeof(emailpass)=='undefined' || email=='' || emailpass=='' || version=='' || pagesize=='' || validator.isInt(pagesize)==false) {
			msg.code=9;
			msg.msg='数据格式错误';
			res.json(msg);
			return;
		}
		version=validator.trim(version);
		pagesize=validator.trim(pagesize);
		emailpass=validator.trim(emailpass);
		email=validator.trim(email);
		if(validator.isEmail(email)==false){
			msg.code=9;
			msg.msg='邮箱格式错误';
			res.json(msg);
			return;
		}
		var versions=models.Version;
		versions.findOne({attributes:['path'],where:{is_last:true},order:[['id','desc']]})
		.then(function(result){
			var releases='';
			if(result){
				releases=result.path;
			}
			var config={version:version,pagesize:pagesize,email:email,emailpass:emailpass,releases:releases};
			var config_str=JSON.stringify(config);
			redis.set('happy_code',config_str);
			msg.msg='success';
			res.json(msg);
		});
	}]
}