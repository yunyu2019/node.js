var validator = require('validator');
var auth=require('../lib/auth');
var logs=require('../lib/logs');
var models = require('../models/index');

module.exports={
	get_index:[auth.authUser,function(req,res){
        var authorid=req.query.authorid;
        if(typeof(authorid)!='undefined' && validator.isInt(authorid)==true){
            authorid=validator.toInt(authorid);
            if(authorid>0){
                var member=models.Member;
                member.findOne({attributes:['id','nicename','status'],where:{id:authorid}})
                .then(function(result){
                    if(result && result.status==1){
                        res.render('book',{title:'书籍管理',author:result});
                    }else{
                        res.render('book',{title:'书籍管理',author:null});
                    }
                });
            }else{
                res.render('book',{title:'书籍管理',author:null});
            }
        }else{
            res.render('book',{title:'书籍管理',author:null});
        }
    }],
    
    get_list:[auth.authUser,function(req,res){
        var msg={code:0,msg:'success',data:null};
        var pagesize=10,pageCount=0;
        var authorid=req.query.authorid;
        var page=req.query.p;
        if(typeof(page)=='undefined' || page=='' || validator.isInt(page)==false){
            page=1;
        }else{
            page=validator.toInt(page);
            if(page<1) page=1
        }
        var where={};
        where.status=true;
        var books=models.Book;
        if(typeof(authorid)!='undefined' && validator.isInt(authorid)==true){
            authorid=validator.toInt(authorid);
            if(authorid>0){
                where.author_id=authorid;
            }
        }
        books.count({where:where}).then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            var member=models.Member;
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            books.belongsTo(member,{foreignKey:'author_id'});
            books.findAll({attributes:['id','name','author_id','descp','created','lasted','target'],include:[{model:member,attributes:['nicename']}],where:where,offset:offset,limit:pagesize})
            .then(function(result){
                msg.data={data:result,pageCount:pageCount,currPage:page};
                res.json(msg);
                return;
            }).catch(function(err){
                logs.error(err,req,res);
                msg='fail';
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            });
        });
    }],

    get_volumn_list:[auth.authUser,function(req,res){
        var msg={code:0,msg:'success',data:null};
        var pagesize=10,pageCount=0;
        var bookid=req.query.bookid;
        var page=req.query.p;
        if(typeof(page)=='undefined' || page=='' || validator.isInt(page)==false){
            page=1;
        }else{
            page=validator.toInt(page);
            if(page<1) page=1
        }
        if(typeof(bookid)=='undefined' ||  validator.isInt(bookid)==false){
            res.redirect('/book');
            return;
        }
        bookid=validator.toInt(bookid);
        var volumn=models.Volumn,where={};
        where.bookid=bookid;
        where.status=true;
        volumn.count({where:where}).then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            volumn.findAll({attributes:['id','name','created','lasted','sort'],where:where,offset:offset,limit:pagesize})
            .then(function(result){
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
    
    get_chapter_list:[auth.authUser,function(req,res){
        var msg={code:0,msg:'success',data:null};
        var pagesize=10,pageCount=0;
        var volumnid=req.query.volumnid;
        var page=req.query.p;
        if(typeof(page)=='undefined' || page=='' || validator.isInt(page)==false){
            page=1;
        }else{
            page=validator.toInt(page);
            if(page<1) page=1
        }
        if(typeof(volumnid)=='undefined' ||  validator.isInt(volumnid)==false){
            res.redirect('/book');
            return;
        }
        volumnid=validator.toInt(volumnid);
        var chapter=models.Chapter,where={};
        where.status=true;
        where.volumnid=volumnid;
        chapter.count({where:where}).then(function(nums){
            if(nums<1){
                msg.data={data:[],pageCount:0,currPage:page};
                res.json(msg);
                return;
            }
            pageCount=Math.ceil(nums/pagesize);
            if(page>=pageCount && pageCount>0) page=pageCount;
            var offset=(page-1)*pagesize;
            chapter.findAll({attributes:['id','name','created','lasted','sort'],where:where,offset:offset,limit:pagesize})
            .then(function(result){
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