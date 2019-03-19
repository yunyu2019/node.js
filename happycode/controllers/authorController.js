var validator = require('validator');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var models = require('../models/index');

module.exports={
	get_index:[auth.authUser,function(req,res){
        res.render('author',{title:'作者管理'});
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
        var authors=models.Member;
        authors.count().then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            authors.findAll({attributes:['id','nicename','email','reg_time','status','last_time'],offset:offset,limit:pagesize})
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
    }]
}