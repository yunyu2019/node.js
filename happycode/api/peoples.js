/**
 * 
 * @authors 
 * @date    2017-02-27 10:24:59
 * @version $Id$
 * @descp   人物谱api
 */
var fs=require('fs');
var path=require('path');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var express = require('express');
var router = express.Router();
var validator = require('validator');
var models=require('../models/index');
var cryptos=require('../lib/cryptos');
var maxlength=2097152;//2M
var extensions='png';
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
	var userid=login_info.id,pspectrum=models.Pspectrum,books=models.Book,sequelize=models.sequelize;
	books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(book){
		if(book && book.status==1 && book.author_id==userid){
			pspectrum.findAll({attributes:[[sequelize.fn('CONCAT','people_',sequelize.col('id')), 'id'],'title','lasted'],where:{bookid:bookid,status:true}})
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
	var book_id=req.body['bookid'];
	var title=req.body['title'];
	var imgbase=req.body['imgbase'];
	var extras=req.body['extras'];
	if(typeof(title)=='undefined' || typeof(book_id)=='undefined' || book_id=='' || typeof(imgbase)=='undefined' || imgbase.length<=22 || typeof(extras)=='undefined' || extras==''){
		msg.msg="参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(title.length<1 || title.length>50){
		msg.msg='标题应在1-50个字符之间';
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
	if(extras.length<1){
		msg.msg='额外数据不能为空';
		msg.code=9;
		res.json(msg);
		return;
	}
	var bookid=book_id.substring(5);
	title=validator.trim(title);
	var base64Data = imgbase.replace(/^data:image\/\w+;base64,/,"");
	base64Data = base64Data.replace(/\s/g,"+");
	var dataBuffer = new Buffer(base64Data,'base64');
	var filesize=dataBuffer.length;
	if(filesize>maxlength){
		msg.code=9;
		msg.msg='最大上传上限为2M';
		res.json(msg);
		return;
	}
	var login_info=res.locals.app_user;
	var userid=login_info.id,user_path=source+'/'+userid;
	var books=models.Book,pspectrum=models.Pspectrum;
	books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(result){
		if(result && result.status==1 && result.author_id==userid){
			!fs.existsSync(user_path) && fs.mkdirSync(user_path,'766');
			var people_path=user_path+'/people';
			if(!fs.existsSync(people_path)){
				fs.mkdirSync(people_path,'766');
			}
			var people_name=people_path+'/people_'+bookid+'_'+Date.now()+'.'+extensions;
			var ws = fs.createWriteStream(people_name,{encoding:'utf8'});
			ws.on('error',function(err){
				logs.error(err,req,res);
				msg.code=9;
				msg.msg='write fail';
				res.json(msg);
				return;
			});
			ws.write(dataBuffer,'utf8');
			ws.end(function(){
				var imgsrc=people_name.replace(user_path,'');
				pspectrum.create({bookid:bookid,authorid:userid,title:title,imgsrc:imgsrc,size:filesize,extras:extras})
				.then(function(people){
					var peopleid='people_'+people.id;
					msg.msg="success";
					var params_key=req.app.get('cookie_key');
					var params_iv=req.app.get('cookie_iv');
					var source=login_info.email+'_'+book_id+'_people_'+title;
					source=cryptos.encrypt(params_key,params_iv,source);
					msg.data={id:peopleid,lasted:people.lasted,source:source};
					res.json(msg);
					return;
				}).catch(function(err){
					logs.error(err,req,res);
					msg.code=9;
					msg.msg="fail1";
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

router.post('/save',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var people_id=req.body['peopleid'];
	if(typeof(people_id)=='undefined' || people_id==''){
		msg.msg="peopleid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(people_id,/^people_(\d+)$/)==false){
		msg.code=9;
		msg.msg="peopleid数据格式错误";
		res.json(msg);
		return;
	}
	var title=req.body['title'];
	var imgbase=req.body['imgbase'];
	var extras=req.body['extras'];
	var flag1=typeof(title)=='undefined' || title=='';
	var flag2=typeof(imgbase)=='undefined' || imgbase.length<=22;
	var flag3=typeof(extras)=='undefined' || extras=='';
	if(flag1 && flag2 && flag3){
		msg.code=9;
		msg.msg="缺少参数错误";
		res.json(msg);
		return;
	}
	var data={},filesize=0,dataBuffer=null,old_people=null;
	if(flag1==false){
		if(title.length<1 || title.length>50){
			msg.msg='标题应在1-50个字符之间';
			msg.code=9;
			res.json(msg);
			return;
		}
		title=validator.trim(title);
		data.title=title;
	}
	if(flag2==false){
		var base64Data = imgbase.replace(/^data:image\/\w+;base64,/,"");
		base64Data = base64Data.replace(/\s/g,"+");
		dataBuffer = new Buffer(base64Data,'base64');
		filesize=dataBuffer.length;
		if(filesize>maxlength){
			msg.code=9;
			msg.msg='最大上传上限为2M';
			res.json(msg);
			return;
		}
	}
	if(flag3==false){
		if(extras.length<1){
			msg.msg='额外数据不能为空';
			msg.code=9;
			res.json(msg);
			return;
		}
		extras=validator.trim(extras);
		data.extras=extras;
	}
	var login_info=res.locals.app_user,peopleid=people_id.substring(7);
	var userid=login_info.id,pspectrum=models.Pspectrum;
	pspectrum.findOne({attributes:['id','authorid','bookid','status','size','title','imgsrc','extras'],where:{id:peopleid}})
	.then(function(people){
		if(people && people.status==1 && people.authorid==userid){
			if(flag2==false){
				var user_path=source+'/'+userid,people_path=user_path+'/people';
				var people_name=people_path+'/people_'+people.bookid+'_'+Date.now()+'.'+extensions;
				var ws = fs.createWriteStream(people_name,{encoding:'utf8'});
				ws.on('error',function(err){
					logs.error(err,req,res);
					msg.code=9;
					msg.msg='write fail';
					res.json(msg);
					return;
				});
				ws.write(dataBuffer,'utf8');
				ws.end();
				var imgsrc=people_name.replace(user_path,'');
				if(people.imgsrc!='') old_people=user_path+people.imgsrc;
				data.imgsrc=imgsrc;
				data.size=filesize;
			}
			var lasted=Date.now();
			data.lasted=lasted;
			people.update(data).then(function(){
				if(old_people && fs.existsSync(old_people)){
					fs.unlinkSync(old_people);
				}
				msg.data={lasted:lasted,id:people_id};
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

router.post('/info',auth.authMember,function(req,res,next){
	var msg={code:0,msg:"",data:null};
	var people_id=req.body['peopleid'];
	if(typeof(people_id)=='undefined' || people_id==''){
		msg.msg="peopleid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(people_id,/^people_(\d+)$/)==false){
		msg.code=9;
		msg.msg="peopleid数据格式错误";
		res.json(msg);
		return;
	}
	var peopleid=people_id.substring(7),login_info=res.locals.app_user;
	var userid=login_info.id,pspectrum=models.Pspectrum;
	pspectrum.findOne({attributes:['id','authorid','status','title','imgsrc','lasted','extras'],where:{id:peopleid}})
	.then(function(people){
		if(people && people.status==1 && people.authorid==userid){
			var data={id:people_id,title:people.title,lasted:people.lasted,imgdata:'',extras:people.extras};
			if(people.imgsrc!=''){
				var people_name=source+'/'+userid+people.imgsrc;
				if(fs.existsSync(people_name)){
					var imgbase='data:image/'+extensions+';base64,';
					var rs = fs.createReadStream(people_name,{encoding : 'base64',bufferSize:1024*1024
					});
					rs.on('data',function(chunk) {
						imgbase+=chunk;
					});
					rs.on('end', function(){
						data.imgdata=imgbase;
						msg.data=data;
						msg.msg='success';
						res.json(msg);
						return;
					});
					rs.on('close',function() {

					});
					rs.on('error',function(err){
						logs.error(err,req,res);
						msg.code=9;
						msg.data='';
						msg.msg='read error';
						res.json(msg);
						return;
					});
				}else{
					msg.data=data;
					msg.msg='success';
					res.json(msg);
					return;
				}
			}else{
				msg.data=data;
				msg.msg='success';
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
	var people_id=req.body['peopleid'];
	if(typeof(people_id)=='undefined' || people_id==''){
		msg.msg="peopleid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(people_id,/^people_(\d+)$/)==false){
		msg.code=9;
		msg.msg="peopleid数据格式错误";
		res.json(msg);
		return;
	}
	var peopleid=people_id.substring(7),login_info=res.locals.app_user;
	var userid=login_info.id,pspectrum=models.Pspectrum;
	pspectrum.findOne({attributes:['id','authorid','status','title','imgsrc','lasted'],where:{id:peopleid}})
	.then(function(people){
		if(people && people.status==1 && people.authorid==userid){
			var lasted=Date.now(),old_people=null;
			var data={lasted:lasted,imgsrc:'',size:0,extras:'',status:false};
			if(people.imgsrc!='') old_people=source+'/'+userid+people.imgsrc;
			people.update(data).then(function(){
				if(old_people && fs.existsSync(old_people)){
					fs.unlinkSync(old_people);
				}
				msg.msg='success';
				msg.data={id:people_id,lasted:lasted}
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