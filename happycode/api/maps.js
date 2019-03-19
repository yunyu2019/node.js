/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-02-21 15:23:14
 * @description 地图api
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
	var userid=login_info.id,maps=models.Maps,books=models.Book,sequelize=models.sequelize;
	books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(book){
		if(book && book.status==1 && book.author_id==userid){
			maps.findAll({attributes:[[sequelize.fn('CONCAT','map_',sequelize.col('id')), 'id'],'title','lasted'],where:{bookid:bookid,status:true}})
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
	if(typeof(title)=='undefined' || typeof(book_id)=='undefined' || book_id=='' || typeof(imgbase)=='undefined' || imgbase.length<=22){
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
	var books=models.Book,maps=models.Maps;
	books.findOne({attributes:['id','author_id','status'],where:{id:bookid}})
	.then(function(result){
		if(result && result.status==1 && result.author_id==userid){
			!fs.existsSync(user_path) && fs.mkdirSync(user_path,'766');
			var map_path=user_path+'/maps';
			if(!fs.existsSync(map_path)){
				fs.mkdirSync(map_path,'766');
			}
			var map_name=map_path+'/maps_'+bookid+'_'+Date.now()+'.'+extensions;
			var ws = fs.createWriteStream(map_name,{encoding:'utf8'});
			ws.on('error',function(err){
				logs.error(err,req,res);
				msg.code=9;
				msg.msg='write fail';
				res.json(msg);
				return;
			});
			ws.write(dataBuffer,'utf8');
			ws.end(function(){
				var imgsrc=map_name.replace(user_path,'');
				maps.create({bookid:bookid,authorid:userid,title:title,imgsrc:imgsrc,size:filesize})
				.then(function(map){
					var mapid='map_'+map.id;
					msg.msg="success";
					var params_key=req.app.get('cookie_key');
					var params_iv=req.app.get('cookie_iv');
					var source=login_info.email+'_'+book_id+'_maps_'+title;
					source=cryptos.encrypt(params_key,params_iv,source);
					msg.data={id:mapid,lasted:map.lasted,source:source};
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
	var map_id=req.body['mapid'];
	if(typeof(map_id)=='undefined' || map_id==''){
		msg.msg="mapid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(map_id,/^map_(\d+)$/)==false){
		msg.code=9;
		msg.msg="mapid数据格式错误";
		res.json(msg);
		return;
	}
	var title=req.body['title'];
	var imgbase=req.body['imgbase'];
	var flag1=typeof(title)=='undefined' || title=='';
	var flag2=typeof(imgbase)=='undefined' || imgbase.length<=22;
	if(flag1 && flag2){
		msg.code=9;
		msg.msg="缺少参数错误";
		res.json(msg);
		return;
	}
	var data={},filesize=0,dataBuffer=null,old_map=null;
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
	var login_info=res.locals.app_user,mapid=map_id.substring(4);
	var userid=login_info.id,maps=models.Maps;
	maps.findOne({attributes:['id','authorid','bookid','status','size','title','imgsrc'],where:{id:mapid}})
	.then(function(map){
		if(map && map.status==1 && map.authorid==userid){
			if(flag2==false){
				var user_path=source+'/'+userid,map_path=user_path+'/maps';
				var map_name=map_path+'/maps_'+map.bookid+'_'+Date.now()+'.'+extensions;
				var ws = fs.createWriteStream(map_name,{encoding:'utf8'});
				ws.on('error',function(err){
					logs.error(err,req,res);
					msg.code=9;
					msg.msg='write fail';
					res.json(msg);
					return;
				});
				ws.write(dataBuffer,'utf8');
				ws.end();
				var imgsrc=map_name.replace(user_path,'');
				if(map.imgsrc!='') old_map=user_path+map.imgsrc;
				data.imgsrc=imgsrc;
				data.size=filesize;
			}
			var lasted=Date.now();
			data.lasted=lasted;
			map.update(data).then(function(){
				if(old_map && fs.existsSync(old_map)){
					fs.unlinkSync(old_map);
				}
				msg.data={lasted:lasted,id:map_id};
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
	var map_id=req.body['mapid'];
	if(typeof(map_id)=='undefined' || map_id==''){
		msg.msg="mapid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(map_id,/^map_(\d+)$/)==false){
		msg.code=9;
		msg.msg="mapid数据格式错误";
		res.json(msg);
		return;
	}
	var mapid=map_id.substring(4),login_info=res.locals.app_user;
	var userid=login_info.id,maps=models.Maps;
	maps.findOne({attributes:['id','authorid','status','title','imgsrc','lasted'],where:{id:mapid}})
	.then(function(map){
		if(map && map.status==1 && map.authorid==userid){
			var data={id:map_id,title:map.title,lasted:map.lasted,imgdata:''};
			if(map.imgsrc!=''){
				var map_name=source+'/'+userid+map.imgsrc;
				if(fs.existsSync(map_name)){
					var imgbase='data:image/'+extensions+';base64,';
					var rs = fs.createReadStream(map_name,{encoding : 'base64',bufferSize:1024*1024
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
	var map_id=req.body['mapid'];
	if(typeof(map_id)=='undefined' || map_id==''){
		msg.msg="mapid参数不合法";
		msg.code=9;
		res.json(msg);
		return;
	}
	if(validator.matches(map_id,/^map_(\d+)$/)==false){
		msg.code=9;
		msg.msg="mapid数据格式错误";
		res.json(msg);
		return;
	}
	var mapid=map_id.substring(4),login_info=res.locals.app_user;
	var userid=login_info.id,maps=models.Maps;
	maps.findOne({attributes:['id','authorid','status','title','imgsrc','lasted'],where:{id:mapid}})
	.then(function(map){
		if(map && map.status==1 && map.authorid==userid){
			if(map.imgsrc==''){
				msg.msg='success';
				msg.data={id:map_id,lasted:map.lasted}
				res.json(msg);
				return;
			}
			var lasted=Date.now();
			var data={imgsrc:'',size:0,title:'',lasted:lasted},old_map=source+'/'+userid+map.imgsrc;
			map.update(data).then(function(){
				if(fs.existsSync(old_map)){
					fs.unlinkSync(old_map);
				}
				msg.msg='success';
				msg.data={id:map_id,lasted:lasted}
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
