/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-02-27 10:24:59
 * @version $Id$
 * @descp   大纲api
 */
var fs=require('fs');
var path=require('path');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var express = require('express');
var router = express.Router();
var Transfer=require('../lib/file');
var validator = require('validator');
var models=require('../models/index');
var cryptos=require('../lib/cryptos');
var multiparty = require('multiparty');
var maxlength=2097152;//2M
var extensions='zip';
var source=path.join(__dirname,'../public/uploads/users');
source=source.replace('\\','/');

router.post('/list',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var book_id=req.body['bookid'];
	if(typeof(book_id)=='undefined' || book_id==''){
		msg.msg="bookid参数不合法";
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
	var bookid=book_id.substring(5),login_info=res.locals.app_user;
	var userid=login_info.id,principles=models.Principles,books=models.Book,sequelize=models.sequelize;
	books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(book){
		if(book && book.status==1 && book.author_id==userid){
			principles.findAll({attributes:[[sequelize.fn('CONCAT','outline_',sequelize.col('id')), 'id'],'class','lasted','size'],where:{bookid:bookid,status:true}})
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
		}else{
			msg.code=9;
			msg.msg="book not found";
			msg.data=[];
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.msg="fail1";
		msg.data=[];
		res.json(msg);
		return;
	});
});

router.post('/create',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
    var form = new multiparty.Form({uploadDir:source});
    form.parse(req,function(err,fields,files){
		if(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='参数不合法';
			res.json(msg);
			return;
		}
		var book_id=fields.bookid[0],classes=fields.classes[0],data=files.data[0];
		if(typeof(book_id)=='undefined' || book_id=='' || typeof(classes)=='undefined' || classes=='' || typeof(data)=='undefined'){
			msg.msg="参数不合法1";
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
		if(validator.isInt(classes)==false || classes <1 || classes>5){
			msg.code=9;
			msg.msg="classes数据格式错误";
			res.json(msg);
			return;
		}
		var exts=data.originalFilename.split('.'),ext=exts.pop();
		if(ext!=extensions){
			msg.code=9;
			msg.msg="file extension error";
			res.json(msg);
			return;
		}
		var uploadedPath = data.path;
		if(!fs.existsSync(uploadedPath)){
			msg.code=9;
			msg.msg="write error";
			res.json(msg);
			return;
		}
		var size=data.size;
		if(size>maxlength){
			fs.unlinkSync(uploadedPath);
			msg.code=9;
			msg.msg='最大上传上限为2M';
			res.json(msg);
			return;
		}
		var bookid=book_id.substring(5);
		var login_info=res.locals.app_user;
		var userid=login_info.id,user_path=source+'/'+userid;
		var books=models.Book,principles=models.Principles;
		books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
		.then(function(result){
			if(result && result.status==1 && result.author_id==userid){
				!fs.existsSync(user_path) && fs.mkdirSync(user_path,'766');
				var outline_path=user_path+'/principles';
				if(!fs.existsSync(outline_path)){
					fs.mkdirSync(outline_path,'766');
				}
				var outline_name=outline_path+'/outline_'+bookid+'_'+classes+'_'+Date.now()+'.'+extensions;
				fs.rename(uploadedPath,outline_name, function(err) {
					if(err){
						fs.existsSync(uploadedPath) && fs.unlinkSync(uploadedPath);
						logs.error(err,req,res);
						msg.code=9;
						msg.msg='move fail';
						res.json(msg);
						return;
					}
					outline_src=outline_name.replace(user_path,'');
					principles.create({bookid:bookid,authorid:userid,class:classes,data_path:outline_src,size:size})
					.then(function(principle){
						var outlineid='outline_'+principle.id;
						msg.msg="success";
						var params_key=req.app.get('cookie_key');
						var params_iv=req.app.get('cookie_iv');
						var source=login_info.email+'_'+book_id+'_outline_'+classes;
						source=cryptos.encrypt(params_key,params_iv,source);
						msg.data={id:outlineid,lasted:principle.lasted,source:source};
						res.json(msg);
						return;
					}).catch(function(err){
						logs.error(err,req,res);
						msg.code=9;
						msg.msg="fail1";
						res.json(msg)
						return;
					});
				});
			}else{
				msg.code=9;
				msg.msg="book not found";
				res.json(msg);
				return;
			}
		}).catch(function(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg="fail2";
			res.json(msg);
		});
    });
});

router.post('/save',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var form = new multiparty.Form({uploadDir:source});
	form.parse(req,function(err,fields,files){
		if(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='参数不合法';
			res.json(msg);
			return;
		}
		var outline_id=fields.outlineid[0],data=files.data[0];
		if(typeof(outline_id)=='undefined' || outline_id=='' || typeof(data)=='undefined'){
			msg.msg="参数不合法1";
			msg.code=9;
			res.json(msg);
			return;
		}
		if(validator.matches(outline_id,/^outline_(\d+)$/)==false){
			msg.code=9;
			msg.msg="outlineid数据格式错误";
			res.json(msg);
			return;
		}
		var uploadedPath = data.path,size=data.size;
		if(!fs.existsSync(uploadedPath)){
			msg.code=9;
			msg.msg="write error";
			res.json(msg);
			return;
		}
		if(size>maxlength){
			fs.unlinkSync(uploadedPath);
			msg.code=9;
			msg.msg='最大上传上限为2M';
			res.json(msg);
			return;
		}
		var login_info=res.locals.app_user,outlineid=outline_id.substring(8);
		var userid=login_info.id,principles=models.Principles;
		principles.findOne({attributes:['id','authorid','bookid','status','size','data_path','class'],where:{id:outlineid}})
		.then(function(outline){
			if(outline && outline.status==1 && outline.authorid==userid){
				var user_path=source+'/'+userid,outline_path=user_path+'/principles',old_outline=null;
				var outline_name=outline_path+'/outline_'+outline.bookid+'_'+outline.class+'_'+Date.now()+'.'+extensions;
				fs.rename(uploadedPath,outline_name, function(err){
					if(err){
						fs.existsSync(uploadedPath) && fs.unlinkSync(uploadedPath);
						logs.error(err,req,res);
						msg.code=9;
						msg.msg='move fail';
						res.json(msg);
						return;
					}
					var outline_src=outline_name.replace(user_path,'');
					if(outline.data_path!='') old_outline=user_path+outline.data_path;
					var lasted=Date.now();
					var data={'lasted':lasted,'size':size,'data_path':outline_src};
					outline.update(data).then(function(){
						if(old_outline && fs.existsSync(old_outline)){
							fs.unlinkSync(old_outline);
						}
						msg.data={lasted:lasted,id:outline_id};
						msg.msg='success';
						res.json(msg);
						return;
					}).catch(function(err){
						logs.error(err,req,res);
						msg.code=9;
						msg.msg='update fail';
						res.json(msg);
						return;
					});
				});
			}else{
				msg.code=9;
				msg.msg='record not  found';
				res.json(msg);
				return;
			}
		}).catch(function(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='record found error';
			res.json(msg);
			return;
		});
	});
});

router.post('/info',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var outline_id=req.body['outlineid'];
	if(typeof(outline_id)=='undefined' || outline_id==''){
		msg.msg="outlineid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(outline_id,/^outline_(\d+)$/)==false){
		msg.code=9;
		msg.msg="outlineid数据格式错误";
		res.json(msg);
		return;
	}
	var outlineid=outline_id.substring(8),login_info=res.locals.app_user;
	var userid=login_info.id,principles=models.Principles;
	principles.findOne({attributes:['id','authorid','status','class','data_path','lasted','size'],where:{id:outlineid}})
	.then(function(outline){
		if(outline && outline.status==1 && outline.authorid==userid){
			if(outline.data_path!=''){
				var outline_name=source+'/'+userid+outline.data_path;
				var dst_name='outline_'+outline.bookid+'_'+outline.class+'.'+extensions;
				if(fs.existsSync(outline_name)){
					res.set({
					"Content-type":"application/octet-stream",
					"Content-Disposition":"attachment;filename="+encodeURI(dst_name)
					});
					transfer=new Transfer(req,res)
					transfer.Download(outline_name,dst_name);
				}else{
					msg.data='';
					msg.msg='success';
					res.json(msg);
					return;
				}
			}else{
				msg.code=9;
				msg.msg='nothing';
				res.json(msg);
				return;
			}
		}else{
			msg.code=9;
			msg.data='';
			msg.msg='record not found';
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.data='';
		msg.msg='record found error';
		res.json(msg);
		return;
	});
});

router.post('/delete',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var outline_id=req.body['outlineid'];
	if(typeof(outline_id)=='undefined' || outline_id==''){
		msg.msg="outlineid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(outline_id,/^outline_(\d+)$/)==false){
		msg.code=9;
		msg.msg="outlineid数据格式错误";
		res.json(msg);
		return;
	}
	var outlineid=outline_id.substring(8),login_info=res.locals.app_user;
	var userid=login_info.id,principles=models.Principles;
	principles.findOne({attributes:['id','authorid','status','size','data_path','lasted'],where:{id:outlineid}})
	.then(function(outline){
		if(outline && outline.status==1 && outline.authorid==userid){
			if(outline.data_path==''){
				msg.msg='success';
				msg.data={id:outline_id,lasted:outline.lasted}
				res.json(msg);
				return;
			}
			var lasted=Date.now(),old_outline=null;
			var data={lasted:lasted,data_path:'',size:0};
			if(outline.data_path!='') old_outline=source+'/'+userid+outline.data_path;
			outline.update(data).then(function(){
				if(old_outline && fs.existsSync(old_outline)){
					fs.unlinkSync(old_outline);
				}
				msg.msg='success';
				msg.data={id:outline_id,lasted:lasted}
				res.json(msg);
				return;
			}).catch(function(err){
				logs.error(err,req,res);
				msg.code=9;
				msg.data='';
				msg.msg='delete error';
				res.json(msg);
				return;
			});
		}else{
			msg.code=9;
			msg.data='';
			msg.msg='record not found';
			res.json(msg);
			return;
		}
	}).catch(function(err){
		logs.error(err,req,res);
		msg.code=9;
		msg.data='';
		msg.msg='record found error';
		res.json(msg);
		return;
	});
});
module.exports=router