var nowPage=1,maxPage,request,thisPageUrl = '/focus/list',flag = true;
$(function(){
    $('#mark').css({'width':$(window).width(),'height':$(window).height()});
    $('#add').css('left',$(window).width()/2-($('#add').width()+100)/2);
    $('#change').css('left',$(window).width()/2-($('#change').width()+100)/2);
    //加载列表
    request = function(url,page) {
        $.get(url,{p:page?page:1},function(data){
            var res=data.data;
            $('#managementSys #list table tbody').html('').append(function(){
                var list,datas=res.data;
                for(var i=0,len=datas.length; i <len; i++) {
                    var is_active=datas[i].active,button;
                    if(datas[i].is_active == 1){
                        is_active = '<em class="focus_active">'+is_active+'</em>';
                        button="<button class='forbiden btn btn-danger' data='"+datas[i].id+"'>关闭</button>";
                    }else{
                        button = "<button class='enabled btn btn-primary' data='"+datas[i].id+"'>启用</button>"
                    }
                    list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].title+"</td>" +
                        "<td><img src='/uploads"+datas[i].imgsrc+"' width=\"100\"/></td>" +
                        "<td>"+datas[i].url+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+datas[i].sort+"</td>" +
                        "<td>"+is_active+"</td>" +
                        "<td class='operation'>" +
                        button + "&nbsp;"+
                        "<button class='change btn btn-primary' data='"+datas[i].id+"'>修改</button>"
                        "</td>"+
                        "<tr>";

                }
                return list;
            });
            maxPage =res.pageCount;
            if(flag){
                //初始化分页
                $pagination(maxPage);
            }
        });
    };

    //修改
    $(document).on('click','#list .change',function(){
        $('#mark,#change').show();
        var focusid=$(this).attr('data');
        var focus_info,obj=$(this);
        $.ajax({
            type:'post',
            url:'/focus/info',
            data:'focusid='+focusid,
            success:function(result){
                if(result.data){
                    focus_info=result.data;
                    $('#change_form #focus-title').val(focus_info.title);
                    $('#change_form #focus-url').val(focus_info.url);
                    $('#change_form #focus-sort').val(focus_info.sort);
                    $('#change_form #changefocusImg').val(focus_info.imgsrc);
                    $('#change_form #focus_descp').val(focus_info.descp);
                   if($('#focus_thumb').length>0){
                        $('#focus_thumb').attr('src','/uploads'+focus_info.imgsrc);
                   }else{
                        var image='<img id="focus_thumb" src="/uploads'+focus_info.imgsrc+'" width="100"/>';
                        $('#change_form #changefocusImg').before(image);
                   }
                    
                }else{
                    alert('参数错误');
                    $('#mark,#change').hide();
                }
            }
        });
        $('#change_form .focus-image').on("fileuploaded", function (event,data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#change_form #changefocusImg').val(data.response.data);
            }
        });
        $("#change_form").validate({
            rules:{
                focusTitle:{required:true,rangelength:[1,30]},
                focusUrl:{required:true,url:true},
                focusSort:{required:true,digits:true},
                focusDescp:{maxlength:150}
            },
            messages:{
                focusTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                focusUrl:{required:"链接地址必填",url:"链接地址格式错误"},
                focusSort:{required:"排序必填",digits:"排序必须是整数"},
                focusDescp:{maxlength:"输入字符已超过150"}
            },
            submitHandler: function() {
                var title=$('#change_form #focus-title').val();
                var urls=$('#change_form #focus-url').val();
                var sort=$('#change_form #focus-sort').val();
                var image=$('#change_form #changefocusImg').val();
                var descp=$('#change_form #focus_descp').val();
                if(title==focus_info.title && urls==focus_info.url && sort==focus_info.sort && focus_info.imgsrc==image && focus_info.descp==descp){
                    alert('无需修改');
                    return false;
                }
                var post_data="Focus[id]="+focusid+"&Focus[title]="+title+"&Focus[url]="+urls+"&Focus[sort]="+sort+"&Focus[image]="+image+'&Focus[descp]='+descp;
                $.ajax({
                    type:"post",
                    url:'/focus/save',
                    data:post_data,
                    success:function(result){
                        if(result.code!=0){
                            $('#change_message').html('修改失败');
                        }else{
                            obj.parent().prevAll().eq(1).html(sort);
                            obj.parent().prevAll().eq(3).html(urls);
                            obj.parent().prevAll().eq(4).html('<img src="/uploads'+image+'" width="100"/>');
                            obj.parent().prevAll().eq(5).html(title);
                        }
                    },
                    complete:function(){
                        $('#change_form .progress-bar-success').css('width','0%').html('');
                        $('#change_form .kv-upload-progress').addClass('hide');
                        $('#change_form .file-input').addClass('file-input-new');
                        $('#change_form .file-caption-name').removeAttr('title').text('');
                        $('#change_form .error-message').html('');
                        $('#change,#mark').hide();
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#change_message"
        });
    });

    //关闭状态
    $(document).on('click','#list .forbiden',function(){
        var focusid=$(this).attr('data'),obj= $(this);
        if(focusid){
            $.ajax({
                type:"post",
                url:'/focus/lock',
                data:'lock=0&focusid='+focusid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('已关闭');
                        obj.removeClass('forbiden btn-danger').addClass('enabled btn-primary').text('启用');
                    }
                }
            });
        }
    });

    //启用
    $(document).on('click','#list .enabled',function(){
        var focusid=$(this).attr('data'),obj= $(this);
        if(focusid){
            $.ajax({
                type:"post",
                url:'/focus/lock',
                data:'lock=1&focusid='+focusid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('<em class="focus_active">启用中</em>');
                        obj.removeClass('enabled btn-primary').addClass('forbiden btn-danger').text('关闭');
                    }
                }
            });
        }
    });

    //刷新
    $('#managementSys #list #reflash').on('click',function(){
        $.ajax({
                type:"post",
                url:'/focus/reflash',
                success:function(result){
                    if(result.code==0){
                        alert('更新成功');
                    }else{
                        alert('刷新失败');
                    }
                }
        });
    });
    
    //添加
    $('#managementSys #list #create').on('click',function(){
        $('#add,#mark').show();
        $('#add_form .focus-image').on("fileuploaded", function (event, data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#add_form #addfocusImg').val(data.response.data);
            }
        });
        $("#add_form").validate({
            rules:{
                focusTitle:{required:true,rangelength:[1,30]},
                focusUrl:{required:true,url:true},
                focusSort:{required:true,digits:true},
                focusDescp:{maxlength:150}
            },
            messages:{
                focusTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                focusUrl:{required:"链接地址必填",url:"链接地址格式错误"},
                focusSort:{required:"排序必填",digits:"排序必须是整数"},
                focusDescp:{maxlength:"输入字符已超过150"}
            },
            submitHandler: function() {
                var title=$('#add_form #focus-title').val();
                var urls=$('#add_form #focus-url').val();
                var sort=$('#add_form #focus-sort').val();
                var image=$('#add_form #addfocusImg').val();
                var descp=$('#add_form #focus_descp').val();
                if(image==''){
                    alert('没传图片');
                    return false;
                }
                var post_data="Focus[title]="+title+"&Focus[url]="+urls+"&Focus[sort]="+sort+"&Focus[image]="+image+"&Focus[descp]="+descp;
                $.ajax({
                    type:"post",
                    url:'/focus/add',
                    data:post_data,
                    success:function(result){
                        if(result.code!=0){
                            $('#add_message').html('添加失败');
                        }
                    },
                    complete:function(){
                        $('#add,#mark').hide();
                        window.location.href="/focus";
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#add_message"
        });
    });

    request(thisPageUrl);
    //跳页
    $addPage();
    initFileInput('.focus-image','/focus/upload');
});