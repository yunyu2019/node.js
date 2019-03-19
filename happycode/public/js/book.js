var nowPage=1,maxPage,request,thisPageUrl = '/book/list',bookid,authorid,flag = true;
$(function(){
    //加载列表
    request = function(url,page){
        $.get(url,{p:page?page:1},function(data){
            var res=data.data;
            $('#managementSys #list table tbody').html('').append(function(){
                var list,datas=res.data;
                for(var i=0,len=datas.length; i <len; i++) {
                    if(/^\/book\/list\/*/.test(url)){
                        var nicename='';
                        if(datas[i].Member) nicename=datas[i].Member.nicename;
                        list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].name+"</td>" +
                        "<td>"+nicename+"</td>" +
                        "<td>"+datas[i].descp+"</td>" +
                        "<td>"+datas[i].target+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].lasted).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td class='operation'>"+
                        "<a href='#'  class='btn btn-primary book_info' data='"+datas[i].id+"'>书详情</ahref>"+ "&nbsp;" +
                        "</td>"+
                        "<tr>";
                    }else if(/^\/book\/volumn\/list\/*/.test(url)){
                        list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].name+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].lasted).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td class='operation'>"+
                        "<a href='#'  class='btn btn-primary volumn_info' data='"+datas[i].id+"'>卷详情</ahref>"+ "&nbsp;" +
                        "</td>"+
                        "<tr>";
                    }else if(/^\/book\/chapter\/list\/*/.test(url)){
                        list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].name+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].lasted).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td class='operation'>"+
                        "<a href='#'  class='btn btn-primary chapter_info' data='"+datas[i].id+"'>章详情</ahref>"+ "&nbsp;" +
                        "</td>"+
                        "<tr>";
                    }else{
                        var nicename='';
                        if(datas[i].Member) nicename=datas[i].Member.nicename;
                        list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].name+"</td>" +
                        "<td>"+nicename+"</td>" +
                        "<td>"+datas[i].descp+"</td>" +
                        "<td>"+datas[i].target+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].lasted).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td class='operation'>"+
                        "<a href='#'  class='btn btn-primary book_info' data='"+datas[i].id+"'>查看详情</ahref>"+ "&nbsp;" +
                        "</td>"+
                        "<tr>";
                    }
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

    var search=location.search;
    var rule=/authorid=(\d+)&?/;
    if(rule.test(search)){
        var m=search.match(rule);
        authorid=m[1];
        thisPageUrl+='?authorid='+authorid;
    }
    

    $(document).on('click','.book_info',function(){
        flag = true;
        var book_name=$(this).parent().prevAll().eq(5);
        bookid=$(this).attr('data');
        var obj=$('.book_menu .book_name');
        if(typeof(book_name[0])!='undefined'){
            $('.book_menu').append(' <em class="menu_filter">></em> <a href="#" class="book_info" data="'+bookid+'"><em class="book_name">'+book_name.html()+'</em></a>');
        }else{
            $(this).nextAll().remove();
        }
        
        thisPageUrl='/book/volumn/list?bookid='+bookid;
        $('#list .table thead tr').html('<th>ID</th><th>卷名</th><th>加入时间</th><th>最后修改</th><th>操作</th>');
        $('.pagination').html('');
        request(thisPageUrl);
        $addPage();
    });

    $(document).on('click','.volumn_info',function(){
        flag = true;
        var volumn_name=$(this).parent().prevAll().eq(2);
        var volumnid=$(this).attr('data');
        var obj=$('.book_menu .volumn_name');
        if(typeof(volumn_name[0])!='undefined'){
            var val=volumn_name.html();
            if(obj.length<1){
                $('.book_menu').append(' <em class="menu_filter">></em> <em class="volumn_name">'+val+'</em>');
            }else{
                $('.book_menu .volumn_name').html(val);
            }
        }
        thisPageUrl='/book/chapter/list?volumnid='+volumnid;
        $('#list .table thead tr').html('<th>ID</th><th>章名</th><th>加入时间</th><th>最后修改</th><th>操作</th>');
        $('.pagination').html('');
        request(thisPageUrl);
        $addPage();
    });

    $(document).on('click','.book_list',function(){
        flag=true;
        $('.book_menu').html('<a href="#" class="book_list">书籍列表</a>');
        thisPageUrl='/book/list';
        $('#list .table thead tr').html('<th>ID</th><th>书籍</th><th>作者</th><th>简介</th><th>目标字数(万字)</th><th>加入时间</th><th>最后修改</th><th>操作</th>');
        $('.pagination').html('');
        request(thisPageUrl);
        $addPage();
    });
    $(document).on('click','.book_list_author',function(){
        flag=true;
        var author=$(this).text();
        $('.book_menu').html('<a href="#" class="book_list">书籍列表</a> <em class="menu_filter">></em> <a href="#" class="book_list_author"><em class="author" style="margin-right: 10px;">'+author+'</em></a>');
        thisPageUrl='/book/list?authorid='+authorid;
        $('#list .table thead tr').html('<th>ID</th><th>书籍</th><th>作者</th><th>简介</th><th>目标字数(万字)</th><th>加入时间</th><th>最后修改</th><th>操作</th>');
        $('.pagination').html('');
        request(thisPageUrl);
        $addPage();
    });

    request(thisPageUrl);
    $addPage();
});