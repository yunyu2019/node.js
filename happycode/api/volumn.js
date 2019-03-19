/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2016-12-15 11:15:57
 * @description 卷api
 */
var express = require('express');
var router = express.Router();
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var cryptos=require('../lib/cryptos');
var validator    = require('validator');
var models=require('../models/index');

//获取单本书籍的卷列表
router.post('/list',auth.authMember,function(req, res, next) {
	var book_id=req.body.bookid;
	var msg={code:0,msg:"",data:null};
	if(typeof(book_id)=='undefined' || book_id==''){
		msg.code=9;
		msg.msg="格式错误1";
		res.json(msg);
		return;
	}
	if(validator.matches(book_id,/^book_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误2";
		res.json(msg);
		return;
	}
	try{
		var login_info=res.locals.app_user;
		var bookid=book_id.substring(5);
		var volumn=models.Volumn,sequelize=models.sequelize;
		var fields=[[sequelize.fn('CONCAT','volumn_',sequelize.col('id')), 'id'],'name','lasted','sort'];
		if(typeof(req.body.t)!='undefined' && req.body.t=='sync'){
			fields.pop();
		}
		volumn.findAll({attributes:fields,where:{authorid:login_info.id,bookid:bookid,status:true}})
		.then(function(result){
			msg.data=result;
			msg.msg="success";
			res.json(msg);
			return;
		}).catch(function(err){
			logs.error(err,req,res);
			msg.msg="success";
			msg.data=[];
			res.json(msg);
			return;

		});
	}catch(e){
		msg.code=9;
		msg.msg="格式错误3";
		res.json(msg);
	}
});

//添加卷
router.post('/add',auth.authMember,function(req, res, next) {
	var book_id=req.body['Volumn[bookid]'];
	var title=req.body['Volumn[name]']
	var msg={code:0,msg:"",data:null};
	if(typeof(book_id)=='undefined' || typeof(title)=='undefined' || book_id=='' || title==''){
		msg.code=9;
		msg.msg="格式错误";
		res.json(msg);
		return;
	}
	title=validator.trim(title);
	book_id=validator.trim(book_id);
	if(title.length<1 || title.length>21){
		msg.code=9;
		msg.msg="格式错误";
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
		title=validator.escape(title);
		var login_info=res.locals.app_user,book=models.Book;
		book.findOne({attributes:['id','author_id','name','status','lasted'],where:{id:bookid}})
		.then(function(result){
			var author=login_info.id;
			if(result && result.status==1 && result.author_id==author){
				var sequelize=models.sequelize,volumn=models.Volumn,list=[];
				return sequelize.transaction(function(t){
					return volumn.create({bookid:bookid,authorid:author,name:title,created:Date.now(),lasted:Date.now()},{transaction:t})
					.then(function(volm){
						var params_key=req.app.get('cookie_key'),params_iv=req.app.get('cookie_iv');
						var source=login_info.email+'_'+result.name+'_'+volm.name;
						source=cryptos.encrypt(params_key,params_iv,source);
						list.push({source:source,id:'volumn_'+volm.id,lasted:volm.lasted,type:'volumn'});
						var book_last=Date.now();
						return result.update({lasted:book_last},{transaction:t})
						.then(function(){
							list.push({type:'book',id:book_id,lasted:book_last});
						});
					});
				}).then(function(){
					msg.msg='success';
					msg.data=list;
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
				msg.msg="fail2";
				res.json(msg);
				return;
			}
		}).catch(function(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg="fail3";
			res.json(msg);
		});
	}catch(e){
		msg.code=9;
		msg.msg="格式错误";
		res.json(msg);
	}
});

//根据卷id获取单卷信息
router.post('/info',auth.authMember,function(req, res, next){
	var volumn_id=req.body.volumnid;
	var msg={code:0,msg:"",data:null};
	if(typeof(volumn_id)=='undefined' || volumn_id==''){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(volumn_id,/^volumn_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var volumnid=volumn_id.substring(7);
		var login_info=res.locals.app_user;
		var volumn=models.Volumn;
		volumn.findOne({attributes:['id','authorid','status','lasted','name'],where:{id:volumnid}})
		.then(function(result){
			if(result && result.status==1 && result.authorid==login_info.id){
				msg.data=[{id:volumn_id,name:result.name,lasted:result.lasted}];
			}else{
				msg.data=[];
			}
			msg.msg='success';
			res.json(msg);
			return;
		}).catch(function(err){
			logs.error(err,req,res);
			msg.data=[];
			msg.msg='success';
			res.json(msg);
			return;
		});
	}catch(e){
		msg.msg="数据格式错误1";
		msg.code=9;
		res.json(msg);
	}
});

//修改保存卷信息
router.post('/save',auth.authMember,function(req,res,next) {
	var volumn_id=req.body['Volumn[id]'];
	var title=req.body['Volumn[name]'];
	var msg={code:0,msg:"",data:null};
	var flag=typeof(volumn_id)=='undefined' || typeof(title)=='undefined' || volumn_id=='' || title=='';
	if(flag){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
	title=validator.trim(title);
	volumn_id=validator.trim(volumn_id);
	if(title.length<1 || title.length>31){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(volumn_id,/^volumn_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var volumnid=volumn_id.substring(7);
		title=validator.escape(title);
		var login_info=res.locals.app_user;
		var volumn=models.Volumn;
		volumn.findOne({attributes:['id','bookid','authorid','status'],where:{id:volumnid}})
		.then(function(result){
			if(result && result.status==1 && result.authorid==login_info.id){
				var book=models.Book,sequelize=models.sequelize,list=[],bookid=result.bookid;
				return sequelize.transaction(function(t){
					var volumn_last=Date.now();
					return result.update({name:title,edited:volumn_last,lasted:volumn_last},{transaction:t})
					.then(function(){
						list.push({id:volumn_id,type:'volumn',lasted:volumn_last});
						var book_last=Date.now();
						return book.update({lasted:book_last},{where:{id:bookid},transaction:t})
						.then(function(){
							list.push({id:'book_'+bookid,type:'book',lasted:book_last});
						});
					});
				}).then(function(){
					msg.data=list;
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
	}catch(e){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
	}
});

//删除卷信息
router.post('/delete',auth.authMember,function(req, res, next) {
	var volumn_id=req.body.volumnid;
	var msg={code:0,msg:"",data:null};
	if(typeof(volumn_id)=='undefined' || volumn_id==''){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(volumn_id,/^volumn_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		volumn_id=validator.trim(volumn_id);
		var volumnid=volumn_id.substring(7);
		var login_info=res.locals.app_user;
		var volumn=models.Volumn;
		volumn.findOne({attributes:['id','bookid','authorid','status'],where:{id:volumnid}})
		.then(function(result){
			if(result && result.status==1 && result.authorid==login_info.id){
				var chapter=models.Chapter,book=models.Book,sequelize=models.sequelize,list=[];
				return sequelize.transaction(function(t){
					return chapter.update({status:false,lasted:Date.now()},{where:{volumnid:result.id,status:true},transaction:t})
					.then(function(){
						return result.update({status:false,lasted:Date.now()},{transaction:t})
						.then(function(){
							var book_last=Date.now();
							return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
							.then(function(){
								list.push({type:'book',id:'book_'+result.bookid,lasted:book_last});
							});
						});
					})
				}).then(function(){
					msg.msg='success';
					msg.data=list;
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
	}catch(e){
		msg.msg="数据格式错误";
		msg.code=9;
		res.json(msg);
		return;
	}
});

//获取书所有相关的卷章信息
router.post('/sync',auth.authMember,function(req, res, next) {
	var book_id=req.body.bookid;
	var msg={code:0,msg:"",data:null};
	if(typeof(book_id)=='undefined' || book_id==''){
		msg.code=9;
		msg.msg="格式错误";
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
		var login_info=res.locals.app_user;
		var bookid=book_id.substring(5);
		var volumn=models.Volumn,chapter=models.Chapter,author=login_info.id,datas=[],sequelize=models.sequelize;
		volumn.findAll({attributes:[[sequelize.fn('CONCAT','volumn_',sequelize.col('id')), 'id'],'name','lasted'],where:{bookid:bookid,authorid:author,status:true}})
		.then(function(result){
			var list={'type':'volumn',data:null};
			if(result){
				list.data=result;
			}
			datas.push(list);
			chapter.findAll({attributes:[[sequelize.fn('CONCAT','chapter_',sequelize.col('id')), 'id'],'name','lasted'],where:{bookid:bookid,authorid:author,status:true}})
			.then(function(chaps){
				var list={'type':'chapter',data:null};
				if(chaps){
					list.data=chaps;
				}
				datas.push(list);
				msg.data=datas;
				msg.msg='success';
				res.json(msg);
			});
		});
	}catch(e){
		msg.code=9;
		msg.msg="格式错误";
		res.json(msg);
	}
});

module.exports=router