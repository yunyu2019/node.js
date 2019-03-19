var nowPage=1,maxPage,request,thisPageUrl = '/play/list',flag =true;
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
                        is_active = '<em class="play_active">'+is_active+'</em>';
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
        var playid=$(this).attr('data');
        var play_info,obj=$(this);
        $.ajax({
            type:'post',
            url:'/play/info',
            data:'playid='+playid,
            success:function(result){
                if(result.data){
                    play_info=result.data;
                    $('#change_form #play-title').val(play_info.title);
                    $('#change_form #play-url').val(play_info.url);
                    $('#change_form #play-sort').val(play_info.sort);
                    $('#change_form #changeplayImg').val(play_info.imgsrc);
                   if($('#play_thumb').length>0){
                        $('#play_thumb').attr('src','/uploads'+play_info.imgsrc);
                   }else{
                        var image='<img id="play_thumb" src="/uploads'+play_info.imgsrc+'" width="100"/>';
                        $('#change_form #changeplayImg').before(image);
                   }
                    
                }else{
                    alert('参数错误');
                    $('#mark,#change').hide();
                }
            }
        });
        $('#change_form .play-image').on("fileuploaded", function (event,data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#change_form #changeplayImg').val(data.response.data);
            }
        });
        $("#change_form").validate({
            rules:{
                playTitle:{required:true,rangelength:[1,30]},
                playUrl:{required:true,url:true},
                playSort:{required:true,digits:true},
            },
            messages:{
                playTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                playUrl:{required:"链接地址必填",url:"链接地址格式错误"},
                playSort:{required:"排序必填",digits:"必须是整数"},
            },
            submitHandler: function() {
                var title=$('#change_form #play-title').val();
                var urls=$('#change_form #play-url').val();
                var sort=$('#change_form #play-sort').val();
                var image=$('#change_form #changeplayImg').val();
                if(title==play_info.title && urls==play_info.url && sort==play_info.sort && play_info.imgsrc==image){
                    alert('无需修改');
                    return false;
                }
                $.ajax({
                    type:"post",
                    url:'/play/save',
                    data:"Play[id]="+playid+"&Play[title]="+title+"&Play[url]="+urls+"&Play[sort]="+sort+"&Play[image]="+image,
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
        var playid=$(this).attr('data'),obj= $(this);
        if(playid){
            $.ajax({
                type:"post",
                url:'/play/lock',
                data:'lock=0&playid='+playid,
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
        var playid=$(this).attr('data'),obj= $(this);
        if(playid){
            $.ajax({
                type:"post",
                url:'/play/lock',
                data:'lock=1&playid='+playid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('<em class="play_active">启用中</em>');
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
                url:'/play/reflash',
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
        $('#add_form .play-image').on("fileuploaded", function (event, data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#add_form #addplayImg').val(data.response.data);
            }
        });
        $("#add_form").validate({
            rules:{
                playTitle:{required:true,rangelength:[1,30]},
                playUrl:{required:true,url:true},
                playSort:{required:true,digits:true},
            },
            messages:{
                playTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                playUrl:{required:"链接地址必填",url:"链接地址格式错误"},
                playSort:{required:"排序必填",digits:"必须是整数"},
            },
            submitHandler: function() {
                var title=$('#add_form #play-title').val();
                var urls=$('#add_form #play-url').val();
                var sort=$('#add_form #play-sort').val();
                var image=$('#add_form #addplayImg').val();
                if(image==''){
                    alert('没传图片');
                    return false;
                }
                $.ajax({
                    type:"post",
                    url:'/play/add',
                    data:"Play[title]="+title+"&Play[url]="+urls+"&Play[sort]="+sort+"&Play[image]="+image,
                    success:function(result){
                        if(result.code!=0){
                            $('#add_message').html('添加失败');
                        }
                    },
                    complete:function(){
                        $('#add,#mark').hide();
                        window.location.href="/play";
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#add_message"
        });
    });
    request(thisPageUrl);
    $addPage();
    initFileInput('.play-image','/play/upload');
});