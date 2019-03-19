/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2016-12-30 11:15:57
 * @description 版本api
 */
var fs=require('fs');
var express = require('express');
var logs=require('../lib/logs');
var redis=require('../lib/redis');
var path=require('path');
var Transfer=require('../lib/file');
var router = express.Router();

router.get('/check',function(req,res,next){
	var msg={code:0,msg:"",data:null};
	redis.get('happy_code',function(err,reply){
		if(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='fail';
			res.json(msg);
			return;
		}
		if(reply){
			var data=JSON.parse(reply);
			msg.data=data.version;
		}
		msg.msg='success';
		res.json(msg);
	})
});

router.get('/releases',function(req,res,next){
	var msg={code:0,msg:"",data:null};
	redis.get('happy_code',function(err,reply){
		if(err){
			logs.error(err,req,res);
			msg.code=9;
			msg.msg='fail';
			res.json(msg);
			return;
		}
		if(reply){
			var data=JSON.parse(reply);
			var source=path.join(__dirname,'../public/uploads');
			var dst_name='happy_code_'+data.version+'_releases.asar'
			var releases=data.releases;
			var org_name=path.join(source,releases);
			org_name=org_name.replace('\\','/');
			if(fs.existsSync(org_name)){
				res.set({
				"Content-type":"application/octet-stream",
				"Content-Disposition":"attachment;filename="+encodeURI(dst_name)
				});
				transfer=new Transfer(req,res)
				transfer.Download(org_name,dst_name);
			}else{
				res.json({code:0,msg:'文件不存在'});
			}
		}else{
			res.json({code:0,msg:'文件不存在'});
		}
		/*
        res.set({
        "Content-type":"application/octet-stream",
        "Content-Disposition":"attachment;filename="+encodeURI(dst_name)
    	});
        fReadStream = fs.createReadStream(org_name,{bufferSize:1024 * 1024,encoding:'binary'});
        fReadStream.on("data",(chunk) => res.write(chunk,"binary"));
        fReadStream.on("end",function () {
            res.end();
        });
        */
	})
});
module.exports=router