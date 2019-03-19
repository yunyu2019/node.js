var nowPage=1,maxPage,request,thisPageUrl = '/hook/list',flag=true;
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
                    var is_active='',is_type='',button;
                    if(datas[i].status == 1){
                        is_active = '<em class="play_active">已启用</em>';
                        button="<button class='forbien btn btn-danger' data='"+datas[i].id+"'>关闭</button>";
                    }else{
                        is_active = '未启用';
                        button = "<button class='enabled btn btn-primary' data='"+datas[i].id+"'>启用</button>"
                    }
                    if(datas[i].class==1){
                        is_type = '工具';
                    }else if(datas[i].class==2){
                        is_type = '增强';
                    }else if(datas[i].class==3){
                        is_type = '趣味';
                    }else if(datas[i].class==4){
                        is_type = '主题';
                    }else{
                        is_type = '工具';
                    }
                    list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].title+"</td>" +
                        "<td>"+is_type+"</td>" +
                        "<td>"+datas[i].sources+"</td>" +
                        "<td>"+datas[i].downs+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss')+"</td>" +
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

    $('.hook-file').fileinput({
        language: 'zh',
        uploadUrl:'/hook/upload',
        maxFileSize: 20000,
        maxFilesNum: 1,
        showUpload:true,
        showRemove : true,
        showCaption:true,
        showPreview:false,
        maxFileCount:1,
        autoReplace:true
    });

    $('.hook-file').on('filebrowse', function(event) {
        $('.error-message').html('');
    });

    $('.hook-file').on("filebatchselected", function (event,files) {
        var file=files[0];
        var fileSize=file.size;
        // var ext=file.type.split('/')[1];
        var ext=file.name.substring(file.name.lastIndexOf('.')+1);
        var maxSize = 20*1024*1024;
        var allow=['zip','rar'];
        if(fileSize > maxSize){
            $('.error-message').html('文件应在20M以内');
            return false;
        }
        if(allow.indexOf(ext)<=-1){
            $('.error-message').html('文件格式不正确');
            return false;
        }
    });

    $('.hook-file').on('filecleared', function(event) {
        $('.error-message').html('');
    });

    //修改
    $(document).on('click','#list .change',function(){
        $('#mark,#change').show();
        var hookid=$(this).attr('data');
        var hook_info,obj=$(this);
        $.ajax({
            type:'post',
            url:'/hook/info',
            data:'hookid='+hookid,
            success:function(result){
                if(result.data){
                    hook_info=result.data;
                    var is_selected = '';
                    $('#change_form #hook-title').val(hook_info.title);
                    $('#change_form #hook-sources').val(hook_info.sources);
                    $('#change_form #hook-desc').val(hook_info.description);
                    $('#change_form #addhookFile').val(hook_info.link);
                    var i = hook_info.class;
                    $("#change_form #hook-ect").find("option[value="+i+"]").attr("selected",true);
                    var path = "/uploads"+hook_info.link;
                    $('#change_form #opath').val(path);
                }else{
                    alert('参数错误');
                    $('#mark,#change').hide();
                }
            }
        });
        $('#change_form .hook-file').on("fileuploaded", function (event,data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#change_form #addhookFile').val(data.response.data);
            }
        });
        $("#change_form").validate({
            rules:{
                hookTitle:{required:true,rangelength:[1,30]},
                HookEct:{required:true,digits:true},
                hookSources:{required:true,rangelength:[1,10]},
            },
            messages:{
                hookTitle:{required:"插件名称必填",rangelength:"标题需1-30个字符"},
                HookEct:{required:"插件分类必须选择",digits:"必须是整数"},
                hookSources:{required:"来源必填",digits:"来源需1-10个字符"},
            },
            submitHandler: function() {
                var title=$('#change_form #hook-title').val();
                var ect=$('#change_form #hook-ect').val();
                var sources=$('#change_form #hook-sources').val();
                var description=$('#change_form #hook-desc').val();
                var zipFile=$('#change_form #addhookFile').val();
                if(hook_info.title==title && ect==hook_info.class && sources==hook_info.sources && description==hook_info.description && hook_info.link==zipFile){
                    alert('无需修改');
                    return false;
                }
                $.ajax({
                    type:"post",
                    url:'/hook/save',
                    data:"Hook[id]="+hookid+"&Hook[title]="+title+"&Hook[class]="+ect+"&Hook[sources]="+sources+"&Hook[description]="+description+"&Hook[zipfile]="+zipFile,
                    success:function(result){
                        if(result.code!=0){
                            $('#change_message').html('修改失败');
                        }else{
                            obj.parent().prevAll().eq(3).html(sources);
                            // obj.parent().prevAll().eq(4).html('<img src="/uploads'+image+'" width="100"/>');
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
    $(document).on('click','#list .operation .forbien',function(){
        var hookid=$(this).attr('data'),obj= $(this);
        if(hookid){
            $.ajax({
                type:"post",
                url:'/hook/lock',
                data:'lock=0&hookid='+hookid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('未启用');
                         obj.removeClass('btn-danger').addClass('btn-primary');
                        obj.removeClass('forbien').addClass('enabled').text('启用');
                    }
                }
            });
        }
    });

    //启用
    $(document).on('click','#list .enabled',function(){
        var hookid=$(this).attr('data'),obj= $(this);
        if(hookid){
            $.ajax({
                type:"post",
                url:'/hook/lock',
                data:'lock=1&hookid='+hookid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('<em class="play_active">已启用</em>');
                        obj.removeClass('btn-primary').addClass('btn-danger');
                        obj.removeClass('enabled').addClass('forbien').text('关闭');
                    }
                }
            });
        }
    });
    
    //添加
    $('#managementSys #list .add button').on('click',function(){
        $('#add,#mark').show();
        $('#add_form .hook-file').on("fileuploaded", function (event, data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#add_form #addhookFile').val(data.response.data);
            }
        });
        $("#add_form").validate({
            rules:{
                hookTitle:{required:true,rangelength:[1,30]},
                HookEct:{required:true,digits:true},
                hookSources:{required:true,rangelength:[1,10]},
            },
            messages:{
                hookTitle:{required:"插件名称必填",rangelength:"标题需1-30个字符"},
                HookEct:{required:"插件分类必须选择",digits:"必须是整数"},
                hookSources:{required:"来源必填",digits:"来源需1-10个字符"},
            },
            submitHandler: function() {
                var title=$('#add_form #hook-title').val();
                var ect=$('#add_form #hook-ect').val();
                var sources=$('#add_form #hook-sources').val();
                var description=$('#add_form #hook-desc').val();
                var zipFile=$('#add_form #addhookFile').val();
                if(zipFile==''){
                    alert('没传插件');
                    return false;
                }
                $.ajax({
                    type:"post",
                    url:'/hook/add',
                    data:"Hook[title]="+title+"&Hook[class]="+ect+"&Hook[description]="+description+"&Hook[sources]="+sources+"&Hook[zipfile]="+zipFile,
                    success:function(result){
                        if(result.code!=0){
                            $('#add_message').html('添加失败');
                        }
                    },
                    complete:function(){
                        $('#add,#mark').hide();
                        window.location.href="/hook";
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
});