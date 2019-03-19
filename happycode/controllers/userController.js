var auth=require('../lib/auth');
var logs=require('../lib/logs');
var bcrypt = require('bcryptjs');
var validator = require('validator');
var cryptos=require('../lib/cryptos');
var models=require('../models/index');

module.exports = {
    get_index:[auth.authUser,function(req,res){
        res.render('user',{title:'用户管理'});
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
        var users=models.User;
        users.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            users.findAll({attributes:['id','name','email','created','status','last_time'],offset:offset,limit:pagesize})
            .then(function(result){
                msg.msg='success';
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

    get_login:[auth.authUser,function(req,res) {
        var login_info=res.locals.admin_user;
        if(typeof(login_info)!='undefined'){
            res.redirect('/user');
        }else{
            res.render('login',{title:"用户登陆",layout:false});
        }
    }],

    post_login:function(req,res){
        var email=req.body['User[email]'];
        var pass=req.body['User[pwd]'];
        var msg={code:0,msg:''};
        if(typeof(email)=='undefined' || typeof(pass)=='undefined' || email=='' || pass==''){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        email=validator.trim(email);
        pass=validator.trim(pass);
        var email_flag=validator.isEmail(email);
        var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
        var pass_flag=validator.matches(pass,pattern);
        if(!email_flag || !pass_flag){
            msg.code=9;
            msg.msg="数据格式错误";
            res.json(msg);
            return;
        }
        var users=models.User;
        users.findOne({attributes:['pwd','name','id','email','last_time'],where:{email:email,status:true}})
        .then(function(result){
            if(result){
                var hash=result.pwd,user_id=result.id,email=result.email;
                var flag=bcrypt.compareSync(pass,hash);
                if(flag){
                    result.update({last_time:Date.now()})
                    .then(function(result){
                        var login_user={happy:"admin",name:result.name,email:email,id:user_id,last_time:result.last_time};
                        var cookie_str=JSON.stringify(login_user);
                        var key=req.app.get('cookie_key');
                        var iv=req.app.get('cookie_iv');
                        var encrypts=cryptos.encrypt(key,iv,cookie_str);
                        res.cookie('happy_user',encrypts,{maxAge:3600000*24,httpOnly: true});
                        msg.msg='success';
                        res.json(msg);
                        return;
                    }).catch(function(err){
                        logs.error(err,req,res);
                        msg.code=9;
                        msg.msg='登陆失败';
                        res.json(msg);
                        return;
                    });
                }else{
                    msg.msg='用户名或者密码错误';
                    msg.code=9;
                    res.json(msg);
                    return;
                }
            }else{
                msg.msg='用户名或者密码错误';
                msg.code=10;
                res.json(msg);
                return;
            }
        }).catch(function(err){
            logs.error(err,req,res);
            msg.msg='用户名或者密码错误1';
            msg.code=9;
            res.json(msg);
            return;
        });
    },

    get_logout:[auth.authUser,function(req,res){
        res.clearCookie('happy_user');
        res.redirect('/user/login');
    }],

    post_add:[auth.authUser,function(req,res){
        var name=req.body['User[name]'];
        var email=req.body['User[email]'];
        var pass=req.body['User[pwd]'];
        var msg={code:0,msg:"",data:null};
        if(typeof(name)=='undefined' || typeof(email)=='undefined' || typeof(pass)=='undefined' || name=='' || email=='' || pass==''){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        name=validator.trim(name);
        email=validator.trim(email);
        pass=validator.trim(pass);
        if(name.length<1 || name.length>31){
            msg.code=9;
            msg.msg="名称应在1-30个字符之间";
            res.json(msg);
            return;
        }
        var email_flag=validator.isEmail(email);
        var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
        var pass_flag=validator.matches(pass,pattern);
        if(!email_flag || !pass_flag){
            msg.code=9;
            msg.msg="密码或者邮箱格式错误";
            res.json(msg);
            return;
        }
        name=validator.escape(name);
        var users=models.User;
        users.create({name:name,email:email,pwd:pass})
        .then(function(result){
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
    }],

    post_save:[auth.authUser,function(req,res){
        var name=req.body['User[name]'];
        var pass=req.body['User[pwd]'];
        var userid=req.body['User[id]'];
        var msg={code:0,msg:"",data:null};
        if(typeof(name)=='undefined' || name=='' || typeof(userid)=='undefined' || userid=='' || validator.isInt(userid)==false){
            msg.msg='昵称格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        name=validator.trim(name);
        userid=validator.trim(userid);
        if(name.length<1 || name.length>31){
            msg.code=9;
            msg.msg="昵称格式错误1";
            res.json(msg);
            return;
        }
        name=validator.escape(name);
        var datas={},users=models.User;
        datas.name=name;
        if(typeof(pass)!='undefined' &&  pass!=''){
            pass=validator.trim(pass);
            var pattern=/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
            var pass_flag=validator.matches(pass,pattern);
            if(!pass_flag){
                msg.msg='密码格式错误';
                msg.code=9;
                res.json(msg);
                return;
            }
            var salt = bcrypt.genSaltSync(10);
            datas.pwd= bcrypt.hashSync(pass,salt);
        }
        users.update(datas,{where:{id:userid,status:true}})
        .then(function(){
            msg.msg='success';
            res.json(msg);
            return;
        }).catch(function(err){
            logs.error(err,req,res);
            msg.msg='修改失败';
            msg.code=9;
            res.json(msg);
            return;
        });
    }],

    post_lock:[auth.authUser,function(req,res){
        var email=req.body.email;
        var lock=req.body.lock;
        var msg={code:0,msg:"",data:null};
        if(typeof(email)=='undefined' || email=='' || typeof(lock)=='undefined' || lock=='' || validator.isInt(lock)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        if(validator.isEmail(email)==false){
            msg.msg='数据格式错误';
            msg.code=9;
            res.json(msg);
            return;
        }
        var datas={};
        datas.status=true;
        if(lock<1){
            datas.status=false;
        }
        var users=models.User;
        users.update(datas,{where:{email:email},limit:1})
        .then(function(){
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