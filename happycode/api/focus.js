var express = require('express');
var router = express.Router();
var logs=require('../lib/logs');
var redis=require('../lib/redis');
var models=require('../models/index');
var pagesize=5,expire=86400;//one day

router.get('/list', function(req, res, next) {
	var msg={code:0,msg:"success",data:null};
	redis.get('focus',function(err,reply){
		if(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.data=[];
			msg.msg='fail';
			res.json(msg);
			return;
		}
		if(reply){
			var data=JSON.parse(reply);
			msg.data=data.data;
			res.json(msg);
			return;
		}else{
			var focus=models.Focus;
			focus.findAll({attributes:['title','imgsrc','url','descp','is_active'],where:{is_active:true},order:[['sort','DESC']],limit:pagesize})
			.then(function(result){
				var datas={data:[]},list=[];
				if(result){
					datas.data=result;
					list=result;
				}
				var focus_data=JSON.stringify(datas);
				redis.setex('focus',expire,focus_data);
				msg.data=list;
				res.json(msg);
				return;
			}).catch(function(err){
				logs.error(err,req,res);
				msg.data=[];
				msg.code=9;
				msg.msg='fail';
				res.json(msg);
				return;
			});
		}
	});
});
module.exports=router