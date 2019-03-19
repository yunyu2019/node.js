var path=require('path');
var fs=require('fs');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var redis=require('../lib/redis');
var validator = require('validator');
var multiparty = require('multiparty');
var models = require('../models/index');

module.exports={
	get_index:[auth.authUser,function(req,res){
		res.render('focus',{title:"焦点图"});
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
        var focus=models.Focus;
        focus.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            focus.findAll({attributes:['id','title','imgsrc','is_active','url','created','sort','descp'],offset:offset,limit:pagesize,order:[['id','DESC']]})
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
        var title=req.body['Focus[title]'];
        var link=req.body['Focus[url]'];
        var sort=req.body['Focus[sort]'];
        var image=req.body['Focus[image]'];
        var descp=req.body['Focus[descp]'];
        if(typeof(title)=='undefined' || typeof(link)=='undefined' || typeof(sort)=='undefined'|| typeof(image)=='undefined' || typeof(descp)=='undefined' || title=='' || link=='' || sort==''||image=='' || validator.isInt(sort)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        link=validator.trim(link);
        sort=validator.trim(sort);
        image=validator.trim(image);
        descp=validator.trim(descp);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='标题应在1-30个字符之间';
            res.json(msg);
            return;
        }
        if(descp.length>0 && descp.length>151){
            msg.code=9;
            msg.msg='文字描述超过150个字符';
            res.json(msg);
            return;
        }
        if(validator.isURL(link)==false){
            msg.code=9;
            msg.msg='url数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        if(descp.length>0) descp=validator.escape(descp);
        var focus=models.Focus;
        focus.create({title:title,imgsrc:image,sort:sort,url:link,descp:descp})
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
        var focusid=req.body['Focus[id]'];
        var title=req.body['Focus[title]'];
        var link=req.body['Focus[url]'];
        var sort=req.body['Focus[sort]'];
        var image=req.body['Focus[image]'];
        var descp=req.body['Focus[descp]'];
        if(typeof(focusid)=='undefined' || typeof(title)=='undefined' || typeof(link)=='undefined' || typeof(sort)=='undefined'|| typeof(image)=='undefined' || typeof(descp)=='undefined' || focusid=='' ||  title=='' || link=='' || sort==''||image=='' || validator.isInt(sort)==false || validator.isInt(focusid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        link=validator.trim(link);
        sort=validator.trim(sort);
        image=validator.trim(image);
        descp=validator.trim(descp);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='标题应在1-30个字符之间';
            res.json(msg);
            return;
        }
        if(descp.length>0 && descp.length>151){
            msg.code=9;
            msg.msg='文字描述超过150个字符';
            res.json(msg);
            return;
        }
        if(validator.isURL(link)==false){
            msg.code=9;
            msg.msg='url格式错误';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        if(descp.length>0) descp=validator.escape(descp);
        var focus=models.Focus;
        focus.update({title:title,imgsrc:image,sort:sort,url:link,descp:descp},{where:{id:focusid},limit:1})
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
        source=source.replace('\\','/');
        var form = new multiparty.Form({uploadDir:source});
        form.parse(req,function(err,fields,files) {
            if(err){
                logs.error(err,req,res);
                msg.code=9;
                msg.msg='fail';
                res.json(msg);
            } else {
                var inputFile = files.focusImage[0];
                var uploadedPath = inputFile.path;
                var ext=inputFile.headers['content-type'];
                ext=ext.split('/')[1];
                var allow=['jpg','jpeg','gif','png'];
                if(allow.indexOf(ext)<=-1){
                    fs.unlinkSync(uploadedPath);
                    msg.code=9;
                    msg.msg='fail';
                    res.json(msg);
                    return;
                }
                var focus_path=source+'/focus';
                !fs.existsSync(focus_path) && fs.mkdirSync(focus_path,'766');
                var dst_name='/focus/focus_'+Date.now()+'.'+ext;
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
        var focusid=req.body.focusid;
        if(typeof(focusid)=='undefined' || focusid=='' || validator.isInt(focusid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        focusid=validator.trim(focusid);
        var focus=models.Focus;
        focus.findOne({attributes:['title','imgsrc','sort','url','descp'],where:{id:focusid}})
        .then(function(result){
            msg.data=result;
            msg.msg='success';
            res.json(msg);
        });
    }],

    post_lock:[auth.authUser,function(req,res){
        var focusid=req.body.focusid;
        var lock=req.body.lock;
        var msg={code:0,msg:"",data:null};
        if(typeof(focusid)=='undefined' || focusid=='' || typeof(lock)=='undefined' || lock=='' || validator.isInt(lock)==false || validator.isInt(focusid)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        focusid=validator.trim(focusid);
        focusid=validator.toInt(focusid);
        var focus=models.Focus,datas={};
        datas.is_active=true;
        if(lock<1){
            datas.is_active=false;
        }
        focus.update(datas,{where:{id:focusid}})
        .then(function(){
            msg.msg='success';
            res.json(msg);
        }).catch(function(err){
            logs.error(err,req,res);
            msg.code=9;
            msg.msg='fail';
            return;
        });
    }],

    post_reflash:[auth.authUser,function(req,res){
        var msg={code:0,msg:""};
        var focus=models.Focus,pagesize=5;
        focus.findAll({attributes:['title','imgsrc','url','descp','is_active'],where:{is_active:true},order:[['sort','DESC']],limit:pagesize})
        .then(function(result){
            var datas={data:[]};
            if(result){
                datas.data=result;
            }
            var focus_data=JSON.stringify(datas);
            redis.setex('focus',86400,focus_data);
            msg.msg='success';
            res.json(msg);
            return;
        }).catch(function(err){
            logs.error(err,req,res);
            msg.code=9;
            msg.msg='fail';
            res.json(msg);
            return;
        });
    }]

}