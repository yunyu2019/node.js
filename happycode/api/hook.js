var express = require('express');
var router = express.Router();
var models = require('../models/index');
var validator = require('validator');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var path = require('path'); 
var fs = require('fs');

//插件列表
router.get('/list',function(req, res, next){
    var msg={code:0,msg:"",data:null};
    var hooks=models.Hooks;
    hooks.findAll({attributes:['id','title','class','sources','downs','description','downstr'],where:{status:true}})
    .then(function(result){
        if(result){
            msg.data=result;
        }else{
            msg.data=[];
        }
        msg.msg='success';
        res.json(msg);
        return;
    }).catch(function(err){
        logs.error(err,req,res);
        msg.code=4;
        msg.msg="fail";
        msg.data=[];
        res.json(msg);
    });
});

//插件的详细
router.get('/detail',function(req,res){
    var id = req.query.id;
    var msg={code:0,msg:"",data:null};
    var hooks=models.Hooks;
    hooks.findOne({attributes:['id','title','class','sources','downs','description','downstr','status'],where:{id:id}})
    .then(function(result){
        if(result && result.status==1){
            msg.data={id:result.id,title:result.title,class:result.class,sources:result.sources,downs:result.downs,description:result.description,downstr:result.downstr};
        }else{
            msg.data=[];
        }
        msg.msg='success';
        res.json(msg);
        return;
    }).catch(function(err){
        logs.error(err,req,res);
        msg.code=4;
        msg.msg="fail";
        msg.data=[];
        res.json(msg);
    });
});

//插件下载
router.get('/download',function(req, res, next) {
    var msg={code:0,msg:"",data:null};
    var downstr = req.query.downstr;
    if(typeof(downstr)=='undefined' || downstr==''){
        msg.code=5;
        msg.msg="文件不存在";
        res.json(msg);
        return;
    }
    downstr=validator.trim(downstr);
    var hooks=models.Hooks;
    hooks.findOne({attributes:['id','link','downs'],where:{downstr:downstr,status:true}})
    .then(function(result){
        if(result){
            var lujing = path.resolve(__dirname, '..');
            var dir = lujing+'/public/uploads/hook/';
            var fileName = result.dataValues.link.substring(result.dataValues.link.lastIndexOf('/')+1);
            var id =result.dataValues.id;
            var downloadFilePath = dir+fileName;
            fs.exists(downloadFilePath,function(exist) {
                if(exist){
                    var filesize = fs.readFileSync(downloadFilePath).length;
                    res.setHeader('Content-Disposition','attachment;filename=' + fileName);
                    res.setHeader('Content-Length',filesize);
                    res.setHeader('Content-Type','application/octet-stream');
                    var fileStream = fs.createReadStream(downloadFilePath,{bufferSize:1024 * 1024});
                    fileStream.pipe(res,{end:true});
                    var downs = result.downs;
                    downs+=1;
                    result.update({downs:downs})
                    .then(function(){
                    }).catch(function(err){
                        logs.error(err,req,res);
                    });
                }else{
                    msg.code=9;
                    msg.msg="文件不存在";
                    res.json(msg);
                }
            });
        }else{
            msg.code=4;
            msg.msg="信息有误";
            res.json(msg);
            return;
        }
    }).catch(function(err){
        logs.error(err,req,res);
        msg.code=4;
        msg.msg="信息有误";
        res.json(msg);
    });
});
module.exports=router