var nowPage=1,maxPage,request,thisPageUrl = '/author/list',flag=true;

$(function(){
    //加载列表
    request = function(url,page){
        $.get(url,{p:page?page:1},function(data){
            var res=data.data;
            $('#managementSys #list table tbody').html('').append(function(){
                var list,datas=res.data;;
                for(var i=0,len=datas.length; i <len; i++) {
                    list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].nicename+"</td>" +
                        "<td>"+datas[i].email+"</td>" +
                        "<td>"+moment(datas[i].reg_time).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].last_time).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td class='operation'>"+
                        "<a href='/book?authorid="+datas[i].id+"'  class='btn btn-primary' index='"+i+"'>查看</ahref>"+ "&nbsp;" +
                        "</td>"+
                        "<tr>"
                };
                return list;
            });
            maxPage =res.pageCount;
            if(flag){
                //初始化分页
                $pagination(maxPage);
            }
        });
    }
    request(thisPageUrl);
    $addPage();
});