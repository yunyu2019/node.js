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
		res.render('play',{title:"新玩法"});
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
        var plays=models.Plays;
        plays.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            plays.findAll({attributes:['id','title','imgsrc','is_active','url','created','sort'],offset:offset,limit:pagesize,order:[['id','DESC']]})
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
        var title=req.body['Play[title]'];
        var link=req.body['Play[url]'];
        var sort=req.body['Play[sort]'];
        var image=req.body['Play[image]'];
        if(typeof(title)=='undefined' || typeof(link)=='undefined' || typeof(sort)=='undefined'|| typeof(image)=='undefined' || title=='' || link=='' || sort==''||image=='' || validator.isInt(sort)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        link=validator.trim(link);
        sort=validator.trim(sort);
        image=validator.trim(image);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='数据格式错误2';
            res.json(msg);
            return;
        }
        if(validator.isURL(link)==false){
            msg.code=9;
            msg.msg='数据格式错误1';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        var plays=models.Plays;
        plays.create({title:title,imgsrc:image,sort:sort,url:link})
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
        var playid=req.body['Play[id]'];
        var title=req.body['Play[title]'];
        var link=req.body['Play[url]'];
        var sort=req.body['Play[sort]'];
        var image=req.body['Play[image]'];
        if(typeof(playid)=='undefined' || typeof(title)=='undefined' || typeof(link)=='undefined' || typeof(sort)=='undefined'|| typeof(image)=='undefined' || playid=='' ||  title=='' || link=='' || sort==''||image=='' || validator.isInt(sort)==false || validator.isInt(playid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        title=validator.trim(title);
        link=validator.trim(link);
        sort=validator.trim(sort);
        image=validator.trim(image);
        if(title.length<1 || title.length>31){
            msg.code=9;
            msg.msg='数据格式错误2';
            res.json(msg);
            return;
        }
        if(validator.isURL(link)==false){
            msg.code=9;
            msg.msg='数据格式错误1';
            res.json(msg);
            return;
        }
        title=validator.escape(title);
        var plays=models.Plays;
        plays.update({title:title,imgsrc:image,sort:sort,url:link},{where:{id:playid},limit:1})
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
                var inputFile = files.playImage[0];
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
                var play_path=source+'/plays';
                !fs.existsSync(play_path) && fs.mkdirSync(play_path,'766');
                var dst_name='/plays/play_'+Date.now()+'.'+ext;
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
        var playid=req.body.playid;
        if(typeof(playid)=='undefined' || playid=='' || validator.isInt(playid)==false){
            msg.code=9;
            msg.msg='数据格式错误';
            res.json(msg);
            return;
        }
        playid=validator.trim(playid);
        var plays=models.Plays;
        plays.findOne({attributes:['title','imgsrc','sort','url'],where:{id:playid}})
        .then(function(result){
            msg.data=result;
            msg.msg='success';
            res.json(msg);
        });
    }],

    post_lock:[auth.authUser,function(req,res){
        var playid=req.body.playid;
        var lock=req.body.lock;
        var msg={code:0,msg:"",data:null};
        if(typeof(playid)=='undefined' || playid=='' || typeof(lock)=='undefined' || lock=='' || validator.isInt(lock)==false || validator.isInt(playid)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        playid=validator.trim(playid);
        playid=validator.toInt(playid);
        var plays=models.Plays,datas={};
        datas.is_active=true;
        if(lock<1){
           datas.is_active=false; 
        }
        plays.update(datas,{where:{id:playid}})
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
        var plays=models.Plays,pagesize=5;
        plays.findAll({attributes:['title','imgsrc','url','is_active'],where:{is_active:true},order:[['sort','DESC']],limit:pagesize})
        .then(function(result){
            var datas={data:[]};
            if(result){
                datas.data=result;
            }
            var plays_data=JSON.stringify(datas);
            redis.setex('plays',86400,plays_data);
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