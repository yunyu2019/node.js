/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2016-12-16 11:15:57
 * @description 章节api
 */
var express = require('express');
var router = express.Router();
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var validator= require('validator');
var cryptos=require('../lib/cryptos');
var models=require('../models/index');
var pagesize=20;

//获取章列表
router.post('/list',auth.authMember,function(req,res,next){
	var volumn_id=req.body.volumnid;
	var lastid=req.body.lastid;
	var msg={code:0,msg:"",data:null};
	if (typeof(volumn_id)=='undefined' || volumn_id=='') {
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
		res.json(msg);
		return;
	}
	if(validator.matches(volumn_id,/^volumn_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	if(typeof(lastid)=='undefined'){
		lastid=null;
	}else{
		lastid=validator.trim(lastid);
		if(validator.matches(lastid,/^chapter_(\d+)$/)==false){
			msg.code=9;
			msg.msg="数据格式错误";
			res.json(msg);
			return;
		}
	}
	try{
		volumn_id=validator.trim(volumn_id);
		var volumnid=volumn_id.substring(7);
		var last_id=0;
		if (lastid){
			last_id=lastid.substring(8);
		}
		var login_info=res.locals.app_user;
		var chapter=models.Chapter,sequelize=models.sequelize;
		chapter.findAll({attributes:[[sequelize.fn('CONCAT','chapter_',sequelize.col('id')), 'id'],'name','lasted'],where:{volumnid:volumnid,authorid:login_info.id,status:true,id:{$gt:last_id}},limit:pagesize})
		.then(function(result){
			msg.data=result;
			msg.msg="success";
			res.json(msg);
			return;
		}).catch(function(err){
			logs.error(e,req,res)
			msg.code=9;
			msg.msg='数据错误';
			msg.data=[];
			res.json(msg);
		});
	}catch(e){
		logs.error(e,req,res)
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
		res.json(msg);
	}
});

//新增章节
router.post('/add',auth.authMember,function(req,res,next){
	var volumn_id=req.body['Chapter[volumnid]'];
	var title=req.body['Chapter[title]'];
	var msg={code:0,msg:"",data:null};
	if(typeof(volumn_id)=='undefined' || typeof(title)=='undefined' || title=='' || volumn_id==''){
		msg.code=9;
		msg.msg='数据错误';
		res.json(msg);
		return;
	}
	volumn_id=validator.trim(volumn_id);
	title=validator.trim(title);
	if(title.length<1 || title.length>31){
		msg.msg='数据格式错误';
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
		var volumn=models.Volumn,author=login_info.id;
		volumn.findOne({attributes:['id','authorid','status','bookid','name'],where:{id:volumnid}})
		.then(function(result){
			if(result && result.status==1 && result.authorid==author){
				var sequelize=models.sequelize,chapter=models.Chapter,list=[],book=models.Book;
				return sequelize.transaction(function(t){
					return chapter.create({bookid:result.bookid,authorid:author,volumnid:volumnid,name:title,created:Date.now(),lasted:Date.now()},{transaction:t})
					.then(function(chapt){
						var params_key=req.app.get('cookie_key'),params_iv=req.app.get('cookie_iv');
						var source=login_info.email+'_'+result.name+'_'+chapt.name;
						source=cryptos.encrypt(params_key,params_iv,source);
						list.push({source:source,id:'chapter_'+chapt.id,lasted:chapt.lasted,type:'chapter'});
						var volumn_last=Date.now(),book_last=null;
						return result.update({lasted:volumn_last},{transaction:t})
						.then(function(){
							list.push({type:'volumn',id:volumn_id,lasted:volumn_last});
							book_last=Date.now();
							return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
							.then(function(){
								list.push({type:'book',id:'book_'+result.bookid,lasted:book_last});
							});
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
			msg.msg='fail3';
			res.json(msg);
			return;
		});
	}catch(e){
		logs.error(e,req,res);
		msg.code=9;
		msg.msg='数据错误';
		res.json(msg);
		return;
	}
});

//获取单章信息
router.post('/info',auth.authMember,function(req,res,next){
	var chapter_id=req.body.chapterid;
	var msg={code:0,msg:"",data:null};
	if (typeof(chapter_id)=='undefined' || chapter_id=='') {
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
		res.json(msg);
		return;
	}
	if(validator.matches(chapter_id,/^chapter_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		chapter_id=validator.trim(chapter_id);
		var chapterid=chapter_id.substring(8);
		var login_info=res.locals.app_user;
		var chapter=models.Chapter;
		chapter.findOne({attributes:['id','name','authorid','status','lasted'],where:{id:chapterid}})
		.then(function(result){
			if(result && result.status==1 && result.authorid==login_info.id){
				msg.data=[{id:chapter_id,name:result.name,lasted:result.lasted}];
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
		logs.error(e,req,res);
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
		res.json(msg);
		return;
	}
});

//获取单章完整信息
router.post('/fullinfo',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"success",data:null};
	var chapter_id=req.body.chapterid;
	if (typeof(chapter_id)=='undefined' || chapter_id=='') {
		msg.code=9;
		msg.msg='数据错误';
		res.json(msg);
		return;
	}
	if(validator.matches(chapter_id,/^chapter_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	chapter_id=validator.trim(chapter_id);
	var login_info=res.locals.app_user,chapterid=chapter_id.substring(8);
	var chapter=models.Chapter,contents=models.Content;
	chapter.findOne({attributes:['id','authorid','status','name','lasted'],where:{id:chapterid}})
	.then(function(result){
		if (result && result.status==1 && result.authorid==login_info.id) {
			var data={id:chapter_id,name:result.name,lasted:result.lasted,content:''};
			contents.findOne({attributes:['content'],where:{chapterid:chapterid}})
			.then(function(cont){
				if(cont){
					data.content=cont.content;
				}
				msg.data=data;
				res.json(msg);
				return;
			}).catch(function(err){
				logs.error(err,req,res);
				msg.code=10;
				msg.msg='fail';
				res.json(msg);
				return;
			});
		}else{
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=8;
		msg.msg='fail';
		res.json(msg);
		return;
	});
});

//修改保存章节
router.post('/save',auth.authMember,function(req,res,next){
	var chapter_id=req.body['Chapter[id]'];
	var title=req.body['Chapter[title]'];
	var msg={code:0,msg:"",data:null};
	var flag=typeof(chapter_id)=='undefined' || typeof(title)=='undefined' || chapter_id=='' || title=='';
	if(flag){
		msg.code=9;
		msg.msg='数据格式错误';
		res.json(msg);
		return;
	}
	chapter_id=validator.trim(chapter_id);
	title=validator.trim(title);
	if(title.length<1 || title.length>31){
		msg.msg='数据格式错误';
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(chapter_id,/^chapter_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var chapterid=chapter_id.substring(8);
		title=validator.escape(title);
		var login_info=res.locals.app_user;
		var chapter=models.Chapter;
		chapter.findOne({attributes:['id','authorid','volumnid','bookid','status'],where:{id:chapterid}})
		.then(function(result){
			if (result && result.status==1 && result.authorid==login_info.id) {
				var sequelize=models.sequelize,volumn=models.Volumn,book=models.Book,list=[];
				return sequelize.transaction(function(t){
					var chapter_last=Date.now(),volumn_last=null,book_last=null;
					return result.update({name:title,lasted:chapter_last},{transaction:t})
					.then(function(){
						list.push({id:chapter_id,lasted:chapter_last,type:'chapter'});
						volumn_last=Date.now();
						return volumn.update({lasted:volumn_last},{where:{id:result.volumnid},transaction:t})
						.then(function(){
							list.push({type:'volumn',id:'volumn_'+result.volumnid,lasted:volumn_last});
							book_last=Date.now();
							return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
							.then(function(){
								list.push({type:'book',id:'book_'+result.bookid,lasted:book_last});
							});
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
		logs.error(e,req,res);
		msg.msg='数据格式错误';
		msg.code=9;
		res.json(msg);
		return;
	}
});

//删除章节
router.post('/delete',auth.authMember,function(req,res,next){
	var chapter_id=req.body.chapterid;
	var msg={code:0,msg:"",data:null};
	if(typeof(chapter_id)=='undefined' || chapter_id==''){
		msg.code=9;
		msg.msg='数据格式错误';
		res.json(msg);
		return;
	}
	if(validator.matches(chapter_id,/^chapter_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var chapterid=chapter_id.substring(8);
		var login_info=res.locals.app_user;
		var chapter=models.Chapter;
		chapter.findOne({attributes:['id','status','authorid','volumnid','bookid'],where:{id:chapterid}})
		.then(function(result){
			if (result && result.status==1 && result.authorid==login_info.id) {
				var sequelize=models.sequelize,volumn=models.Volumn,book=models.Book,list=[];
				return sequelize.transaction(function(t){
					var chapter_last=Date.now(),volumn_last=null,book_last=null;
					return result.update({lasted:chapter_last,status:false},{transaction:t})
					.then(function(){
						volumn_last=Date.now();
						return volumn.update({lasted:volumn_last},{where:{id:result.volumnid},transaction:t})
						.then(function(){
							list.push({type:'volumn',id:'volumn_'+result.volumnid,lasted:volumn_last});
							book_last=Date.now();
							return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
							.then(function(){
								list.push({type:'book',id:'book_'+result.bookid,lasted:book_last});
							});
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
		msg.code=9;
		msg.msg='数据格式错误';
		res.json(msg);
		return;
	}
});

//保存章节内容
router.post('/saveAll',auth.authMember,function(req,res,next){
	var chapter_id=req.body['Chapter[id]'];
	var cont=req.body['Chapter[content]'];
	var msg={code:0,msg:"",data:null};
	if(typeof(chapter_id)=='undefined' || typeof(cont)=='undefined' || chapter_id==''){
		msg.code=9;
		msg.msg='数据错误';
		res.json(msg);
		return;
	}
	chapter_id=validator.trim(chapter_id);
	cont=validator.trim(cont);
	if(cont.length<1){
		msg.msg='数据格式错误';
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(chapter_id,/^chapter_(\d+)$/)==false){
		msg.code=9;
		msg.msg="数据格式错误";
		res.json(msg);
		return;
	}
	try{
		var chapterid=chapter_id.substring(8);
		cont=validator.escape(cont);
		var login_info=res.locals.app_user;
		var chapter=models.Chapter;
		chapter.findOne({attributes:['id','authorid','status','bookid','volumnid'],where:{id:chapterid}})
		.then(function(result){
			if (result && result.status==1 && result.authorid==login_info.id) {
				var sequelize=models.sequelize,volumn=models.Volumn,book=models.Book,contents=models.Content,list=[];
				return sequelize.transaction(function(t){
					return contents.findOrCreate({where:{chapterid:chapterid},defaults:{chapterid:chapterid,content:cont,created:Date.now(),lasted:Date.now()}})
					.spread(function(row,created_flag){
						if(!created_flag){
							return row.update({content:cont,lasted:Date.now()},{transaction:t})
							.then(function(){
								var chapter_last=Date.now();
								return result.update({lasted:chapter_last},{transaction:t})
								.then(function(){
									list.push({type:"chapter",id:'chapter_'+chapterid,lasted:chapter_last});
									var volumn_last=Date.now();
									return volumn.update({lasted:volumn_last},{where:{id:result.volumnid},transaction:t})
									.then(function(){
										list.push({type:"volumn",id:'volumn_'+result.volumnid,lasted:volumn_last});
										var book_last=Date.now();
										return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
										.then(function(){
											list.push({type:"book",id:'book_'+result.bookid,lasted:book_last});
										});
									});
								});
							});
						}else{
							var chapter_last=Date.now();
							return result.update({lasted:chapter_last},{transaction:t})
							.then(function(){
								list.push({type:'chapter',id:'chapter_'+chapterid,lasted:chapter_last});
								var volumn_last=Date.now();
								return volumn.update({lasted:volumn_last},{where:{id:result.volumnid},transaction:t})
								.then(function(){
									list.push({type:"volumn",id:'volumn_'+result.volumnid,lasted:volumn_last});
									var book_last=Date.now();
									return book.update({lasted:book_last},{where:{id:result.bookid},transaction:t})
									.then(function(){
										list.push({type:"book",id:'book_'+result.bookid,lasted:book_last});
									});
								});
							});
						}
					});
				}).then(function(){
					msg.msg='success';
					msg.data=list;
					res.json(msg);
					return;
				}).catch(function(err){
					logs.error(err,req,res);
					msg.code=9;
					msg.msg='fail';
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
		logs.error(e,req,res);
		msg.code=9;
		msg.msg='数据错误';
		res.json(msg);
		return;
	}
});

router.post('/sync',auth.authMember,function(req,res,next){
	var volumn_id=req.body.volumnid;
	var msg={code:0,msg:"",data:null};
	if (typeof(volumn_id)=='undefined' || volumn_id==''){
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
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
		var chapter=models.Chapter,sequelize=models.sequelize;
		chapter.findAll({attributes:[[sequelize.fn('CONCAT','chapter_',sequelize.col('id')), 'id'],'name','lasted'],where:{volumnid:volumnid,authorid:login_info.id,status:true}})
		.then(function(result){
			msg.data=result;
			msg.msg="success";
			res.json(msg);
			return;
		}).catch(function(err){
			logs.error(e,req,res)
			msg.code=9;
			msg.msg='数据错误';
			msg.data=[];
			res.json(msg);
		});
	}catch(e){
		logs.error(e,req,res)
		msg.code=9;
		msg.msg='数据错误';
		msg.data=[];
		res.json(msg);
	}
});

module.exports=router