/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2016-12-15 11:15:57
 * @description 书籍api
 */
var express = require('express');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var cryptos=require('../lib/cryptos');
var validator    = require('validator');
var models=require('../models/index');
var router = express.Router();

//获取作者书籍列表
router.get('/list',auth.authMember,function(req, res, next) {
	var msg={code:0,msg:"",data:null};
	var login_info=res.locals.app_user;
	var book=models.Book,sequelize=models.sequelize;
	book.findAll({where:{author_id:login_info.id,status:true},attributes: [[sequelize.fn('CONCAT','book_',sequelize.col('id')), 'id'],'name','lasted']})
	.then(function(result){
		msg.data=result;
		msg.msg="success";
		res.json(msg);
		return;
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.msg="fail";
		msg.data=[];
		res.json(msg);
		return;
	});
});

//添加书籍
router.post('/add',auth.authMember,function(req, res, next) {
	var title=req.body['Book[name]'];
	var target=req.body['Book[target]'];
	var descp=req.body['Book[descp]'];
	var msg={code:0,msg:"",data:null};
	var flag=typeof(title)=='undefined' || typeof(target)=='undefined' || typeof(descp)=='undefined' || validator.isNumeric(target)==false;
	if(flag){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
	title=validator.trim(title);
	target=validator.trim(target);
	descp=validator.trim(descp);
	var editError;
	if(title.length<1 || title.length>31){
		editError='标题应在1-30个字符之间';
	}else if(descp.length>151){
		editError='简介已超过150个字符';
	}
	if(editError){
		msg.msg=editError;
		msg.code=9;
		res.json(msg);
		return;
	}
	title=validator.escape(title);
	descp=validator.escape(descp);
	var login_info=res.locals.app_user;
	var created=Date.now();
	var book=models.Book;
	book.create({name:title,author_id:login_info.id,created:created,descp:descp,target:target,lasted:created})
	.then(function(result){
		var crypted='book_'+result.id;
		var params_key=req.app.get('cookie_key');
		var params_iv=req.app.get('cookie_iv');
		var source=res.locals.app_user.email+'_'+title;
		source=cryptos.encrypt(params_key,params_iv,source);
		msg.data={source:source,id:crypted,lasted:created};
		msg.msg="success";
		res.json(msg);
		return;
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.msg="fail";
		res.json(msg);
		return;
	});
});

//获取单本书籍信息
router.post('/getbook',auth.authMember,function(req,res,next) {
	var msg={code:0,msg:"",data:null};
	var book_id=req.body.bookid;
	if(typeof(book_id)=='undefined' || book_id==''){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	if(validator.matches(book_id,/^book_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var bookid=book_id.substring(5);
		var login_info=res.locals.app_user;
		var book=models.Book;
		book.findOne({attributes:['id','author_id','name','target','descp','lasted','status'],where:{id:bookid}})
		.then(function(result){
			if(result && result.status==1 && result.author_id==login_info.id){
				msg.data=[{id:book_id,name:result.name,descp:result.descp,lasted:result.lasted,target:result.target}];
			}else{
				msg.data=[];
			}
			msg.msg='success';
			res.json(msg);
			return;
		}).catch(function(err){
			logs.error(e,req,res);
			msg.code=9;
			msg.msg="数据格式错误";
			res.json(msg);
			return;
		});
	}catch(e){
		logs.error(e,req,res);
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
	}
});

//保存修改书籍信息
router.post('/save',auth.authMember,function(req, res, next) {
	var book_id=req.body['Book[id]'];
	var title=req.body['Book[name]'];
	var target=req.body['Book[target]'];
	var descp=req.body['Book[descp]'];
	var msg={code:0,msg:"",data:null};
	var flag=typeof(book_id)=='undefined' || book_id=='';
	if(flag){
		msg.msg="bookid数据缺失";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(book_id,/^book_(\d+)$/)==false){
		msg.code=9;
		msg.msg="bookid数据格式错误";
		res.json(msg);
		return;
	}
	var data={};
	if(typeof(title)!='undefined'){
		title=validator.trim(title);
		if(title.length<1 || title.length>31){
			res.msg='标题应在1-30个字符之间';
			res.code=9;
			res.json(msg);
			return;
		}
		title=validator.escape(title);
		data.name=title;
	}
	if(typeof(target)!='undefined' && validator.isNumeric(target)==true){
		target=validator.trim(target);
		data.target=target;
	}
	if(typeof(descp)!='undefined'){
		descp=validator.trim(descp);
		if(descp.length>151){
			res.msg='简介已超过150个字符';
			res.code=9;
			res.json(msg);
			return;
		}
		descp=validator.escape(descp);
		data.descp=descp;
	}
	if(data==false){
		res.msg='缺失关键参数';
		res.code=9;
		res.json(msg);
		return;
	}
	var bookid=book_id.substring(5);
	var login_info=res.locals.app_user;
	var book=models.Book;
	book.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(result){
		if(result && result.status==1 && result.author_id==login_info.id){
			var lasted=Date.now();
			data.edited=lasted;
			data.lasted=lasted;
			result.update(data).then(function(){
				msg.msg="success";
				msg.data=[{id:book_id,lasted:lasted,type:'book'}];
				res.json(msg);
				return;
			}).catch(function(err){
				logs.error(err,req,res);
				msg.code=9;
				msg.msg="fail1";
				res.json(msg);
				return;
			});
		}else{
			msg.code=9;
			msg.msg='fail2';
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.msg="fail3";
		res.json(msg);
		return;
	});
});

//删除书籍
router.post('/delete',auth.authMember,function(req, res, next) {
	var msg={code:0,msg:""};
	var book_id=req.body.bookid;
	if(typeof(book_id)=='undefined' || book_id==''){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	if(validator.matches(book_id,/^book_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	var bookid=book_id.substring(5);
	var login_info=res.locals.app_user,book=models.Book,sequelize=models.sequelize;
	book.findOne({attributes:['id','status','author_id'],where:{id:bookid}})
	.then(function(result){
		if(result && result.status==1 && result.author_id==login_info.id){
			var chapter=models.Chapter,volumn=models.Volumn;
			return sequelize.transaction(function(t){
				return chapter.update({status:false,lasted:Date.now()},{where:{bookid:bookid,status:true},transaction:t})
				.then(function(){
					return volumn.update({status:false,lasted:Date.now()},{where:{bookid:bookid,status:true},transaction:t})
					.then(function(){
						return result.update({status:false,lasted:Date.now()},{transaction:t});
					});
				})
			}).then(function(){
				msg.msg='success';
				res.json(msg);
				return;
			}).catch(function(err){
				logs.error(err,req,res);
				msg.code=9;
				msg.msg='fail1';
				res.json(msg);
				return;
			});
		}else{
			msg.code=9;
			msg.msg='fail2';
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.msg='fail3';
		res.json(msg);
		return;
	});
});

module.exports=router