var path=require('path');
var fs=require('fs');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var cryptos=require('../lib/cryptos');
var validator = require('validator');
var multiparty = require('multiparty');
var models = require('../models/index');

module.exports={
	get_index:[auth.authUser,function(req,res){
		res.render('hook',{title:"插件"});
	}],

	get_list:[auth.authUser,function(req,res){
		var msg={code:0,msg:'',data:null};
        var pagesize=10,pageCount=0;
        var page=req.query.p;
        if(typeof(page)=='undefined' || page=='' || validator.isInt(page)==false){
            page=1;
        }else{
            page=validator.toInt(page);
            if(page<1) page=1
        }
        var hooks=models.Hooks;
        hooks.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            hooks.findAll({attributes:['id','title','class','link','sources','downs','status','created'],offset:offset,limit:pagesize,order:[['id','DESC']]})
            .then(function(result){
                msg.msg="success";
                msg.data={data:result,pageCount:pageCount,currPage:page};
                res.json(msg);
                return;
            }).catch(function(err){
                logs.error(err,req,res);
                msg.msg='fail';
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            });
        });
	}],

    post_add:[auth.authUser,function(req,res){
        var msg={code:0,msg:'',data:null};
        var title=req.body['Hook[title]'];
        var cclass=req.body['Hook[class]'];
        var description=req.body['Hook[description]'];
        var sources=req.body['Hook[sources]'];
        var link=req.body['Hook[zipfile]'];
        if(typeof(title)=='undefined' || typeof(description)=='undefined' || typeof(link)=='undefined' || typeof(sources)=='undefined'|| typeof(cclass)=='undefined' || title=='' || link=='' || cclass=='' || description=='' || sources=='' || validator.isInt(cclass)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        cclass=validator.trim(cclass);
        description=validator.trim(description);
        sources=validator.trim(sources);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='数据格式错误2';
            res.json(msg);
            return;
        }
        if(sources.length<1 || sources.length>31){
            msg.code=9;
            msg.msg='数据格式错误3';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        sources=validator.escape(sources);
        var params_key=req.app.get('cookie_key');
        var params_iv=req.app.get('cookie_iv');
        var source= title+'_'+cclass+Date.now();
        var downstr=cryptos.encrypt(params_key,params_iv,source);
        var downs = Math.ceil(Math.random()*60);
        var hooks=models.Hooks;
        hooks.create({title:title,class:cclass,link:link,description:description,sources:sources,downs:downs,downstr:downstr})
        .then(function(){
            msg.msg="success";
            res.json(msg);
            return;
        }).catch(function(err){
            logs.error(err,req,res);
            msg.code=9;
            msg.msg="fail";
            return;
        });
    }],

    post_save:[auth.authUser,function(req,res){
        var msg={code:0,msg:'',data:null};
        var hookid=req.body['Hook[id]'];
        var title=req.body['Hook[title]'];
        var cclass=req.body['Hook[class]'];
        var description=req.body['Hook[description]'];
        var sources=req.body['Hook[sources]'];
        var link=req.body['Hook[zipfile]'];
        if(typeof(title)=='undefined' || typeof(description)=='undefined' || typeof(link)=='undefined' || typeof(sources)=='undefined'|| typeof(cclass)=='undefined' || title=='' || link=='' || cclass=='' || description=='' || sources=='' || validator.isInt(cclass)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        cclass=validator.trim(cclass);
        description=validator.trim(description);
        sources=validator.trim(sources);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='数据格式错误2';
            res.json(msg);
            return;
        }
        if(sources.length<1 || sources.length>31){
            msg.code=9;
            msg.msg='数据格式错误3';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        sources=validator.escape(sources);
        var source= title+'_'+cclass;
        var downstr=cryptos.md5(source);
        var hooks=models.Hooks;
        hooks.update({title:title,class:cclass,link:link,description:description,sources:sources,downstr:downstr},{where:{id:hookid},limit:1})
        .then(function(){
            msg.msg="success";
            res.json(msg);
            return;
        }).catch(function(err){
            logs.error(err,req,res);
            msg.code=9;
            msg.msg="fail";
            return;
        });
    }],

    post_upload:[auth.authUser,function(req,res){
        var msg={code:0,msg:'',data:null};
        var source=path.join(__dirname,'../public/uploads');
        var form = new multiparty.Form({uploadDir:source});
        form.parse(req,function(err,fields,files) {
            if(err){
                logs.error(err,req,res);
                msg.code=9;
                msg.msg='fail';
                res.json(msg);
            } else {
                var inputFile = files.hookFile[0];
                var uploadedPath = inputFile.path;
                var ext=inputFile.originalFilename.substring(inputFile.originalFilename.lastIndexOf('.')+1);
                var allow=['zip','rar','7z'];
                if(allow.indexOf(ext)<=-1){
                    fs.unlinkSync(uploadedPath);
                    msg.code=9;
                    msg.msg='fail';
                    res.json(msg);
                    return;
                }
                var hook_path=source+'/hook';
                !fs.existsSync(hook_path) && fs.mkdirSync(hook_path,'766');
                var dst_name='/hook/hook_'+Date.now()+'.'+ext;
                var dstPath = path.join(source,dst_name);
                dstPath=dstPath.replace('\\','/');
                //重命名为真实文件名
                fs.rename(uploadedPath, dstPath, function(err) {
                    if(err){
                        fs.unlinkSync(uploadedPath);
                        logs.error(err,req,res);
                        msg.code=9;
                        msg.msg='fail1';
                    } else {
                        msg.msg='success';
                        msg.data=dst_name;
                    }
                    res.json(msg);
                });
            }
        });
    }],

    post_info:[auth.authUser,function(req,res){
        var msg={code:0,msg:'',data:null};
        var hookid=req.body.hookid;
        if(typeof(hookid)=='undefined' || hookid=='' || validator.isInt(hookid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        hookid=validator.trim(hookid);
        var hooks=models.Hooks;
        hooks.findOne({attributes:['title','class','link','description','sources'],where:{id:hookid}})
        .then(function(result){
            msg.data=result;
            msg.msg='success';
            res.json(msg);
        });
    }],

    post_lock:[auth.authUser,function(req,res){
        var hookid=req.body.hookid;
        var lock=req.body.lock;
        var msg={code:0,msg:"",data:null};
        if(typeof(hookid)=='undefined' || hookid=='' || typeof(lock)=='undefined' || lock=='' || validator.isInt(lock)==false || validator.isInt(hookid)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        hookid=validator.trim(hookid);
        hookid=validator.toInt(hookid);
        var hooks=models.Hooks,datas={};
        datas.status=true;
        if(lock<1){
           datas.status=false; 
        }
        hooks.update(datas,{where:{id:hookid}})
        .then(function(){
            msg.msg='success';
            res.json(msg);
        }).catch(function(err){
            logs.error(err,req,res);
            msg.code=9;
            msg.msg='fail';
            return;
        });
    }]
}