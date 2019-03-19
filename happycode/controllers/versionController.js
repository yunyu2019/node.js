var path=require('path');
var fs=require('fs');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var validator = require('validator');
var cryptos=require('../lib/cryptos');
var multiparty = require('multiparty');
var models = require('../models/index');

module.exports={
    get_index:[auth.authUser,function(req,res){
        res.render('version',{title:"版本管理"});
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
        var versions=models.Version;
        versions.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            versions.findAll({attributes:['id','title','is_last','descp','path','created','url'],offset:offset,limit:pagesize,order:[['id','DESC']]})
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
        var title=req.body['Version[title]'];
        var descp=req.body['Version[descp]'];
        var code_path=req.body['Version[path]'];
        if(typeof(title)=='undefined' || typeof(descp)=='undefined' || typeof(code_path)=='undefined' || title=='' || code_path==''){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        descp=validator.trim(descp);
        code_path=validator.trim(code_path);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='标题格式错误';
            res.json(msg);
            return;
        }
        if(descp.length>0 && descp.length>151){
            msg.code=9;
            msg.msg='版本描述格式错误';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        var source_str=title+'_'+code_path;
        var encrypts=cryptos.md5(source_str);
        if(descp.length>0) descp=validator.escape(descp);
        var versions=models.Version;
        versions.create({title:title,path:code_path,descp:descp,url:encrypts})
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
        var versionid=req.body['Version[id]'];
        var title=req.body['Version[title]'];
        var descp=req.body['Version[descp]'];
        var code_path=req.body['Version[path]'];
        if(typeof(versionid)=='undefined' || typeof(title)=='undefined' || typeof(descp)=='undefined' || typeof(code_path)=='undefined'||  versionid=='' ||  title=='' || code_path==''||  validator.isInt(versionid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        descp=validator.trim(descp);
        versionid=validator.trim(versionid);
        code_path=validator.trim(code_path);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='标题格式错误';
            res.json(msg);
            return;
        }
        if(descp.length>0 && descp.length>151){
            msg.code=9;
            msg.msg='版本描述格式错误';
            res.json(msg);
            return;
        }
        var source_str=title+'_'+code_path;
        var encrypts=cryptos.md5(source_str);
        title=validator.escape(title);
        if(descp.length>0) descp=validator.escape(descp);
        var versions=models.Version;
        versions.update({title:title,path:code_path,descp:descp,url:encrypts},{where:{id:versionid},limit:1})
        .then(function(){
            msg.msg="success";
            msg.data=encrypts;
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
        source=source.replace('\\','/');
        var form = new multiparty.Form({uploadDir:source});
        form.parse(req,function(err,fields,files) {
            if(err){
                logs.error(err,req,res);
                msg.code=9;
                msg.msg='fail';
                res.json(msg);
            } else {
                var inputFile = files.versionFile[0];
                var uploadedPath = inputFile.path;
                var version_path=source+'/version';
                !fs.existsSync(version_path) && fs.mkdirSync(version_path,'766');
                var dst_name='/version/version_'+Date.now()+'.asar';
                var dstPath = path.join(source,dst_name);
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
        var versionid=req.body.versionid;
        if(typeof(versionid)=='undefined' || versionid=='' || validator.isInt(versionid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        versionid=validator.trim(versionid);
        var versions=models.Version;
        versions.findOne({attributes:['title','path','descp'],where:{id:versionid}})
        .then(function(result){
            msg.data=result;
            msg.msg='success';
            res.json(msg);
        });
    }],

    post_lock:[auth.authUser,function(req,res){
        var versionid=req.body.versionid;
        var lock=req.body.lock;
        var msg={code:0,msg:"",data:null};
        if(typeof(versionid)=='undefined' || versionid=='' || typeof(lock)=='undefined' || lock=='' || validator.isInt(lock)==false || validator.isInt(versionid)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        versionid=validator.trim(versionid);
        versionid=validator.toInt(versionid);
        var versions=models.Version,datas={};
        datas.is_last=true;
        if(lock<1){
           datas.is_last=false;
        }
        versions.update(datas,{where:{id:versionid}})
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