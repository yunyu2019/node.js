var nowPage=1,maxPage,request,thisPageUrl = '/version/list',flag = true;
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
                    var is_active=datas[i].releases,button;
                    if(datas[i].is_last == 1){
                        is_active = '<em class="version_active">'+is_active+'</em>';
                        button="<button class='forbiden btn btn-danger' data='"+datas[i].id+"'>关闭</button>";
                    }else{
                        button = "<button class='enabled btn btn-primary' data='"+datas[i].id+"'>启用</button>"
                    }
                    list +=
                        "<tr>" +
                        "<td>"+datas[i].id+"</td>" +
                        "<td>"+datas[i].title+"</td>" +
                        "<td>"+datas[i].descp+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+datas[i].url+"</td>" +
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
        var versionid=$(this).attr('data');
        var version_info,obj=$(this);
        $.ajax({
            type:'post',
            url:'/version/info',
            data:'versionid='+versionid,
            success:function(result){
                if(result.data){
                    version_info=result.data;
                    $('#change_form #version-title').val(version_info.title);
                    $('#change_form #changeversionFile').val(version_info.path);
                    $('#change_form #version_descp').val(version_info.descp);
                }else{
                    alert('参数错误');
                    $('#mark,#change').hide();
                }
            }
        });
        $('#change_form .version-file').on("fileuploaded", function (event,data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#change_form #changeversionFile').val(data.response.data);
            }
        });
        $("#change_form").validate({
            rules:{
                versionTitle:{required:true,rangelength:[1,30]},
                versionDescp:{maxlength:150}
            },
            messages:{
                versionTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                versionDescp:{maxlength:"输入字符已超过150"}
            },
            submitHandler: function() {
                var title=$('#change_form #version-title').val();
                var code_path=$('#change_form #changeversionFile').val();
                var descp=$('#change_form #version_descp').val();
                if(title==version_info.title && version_info.path==code_path && version_info.descp==descp){
                    alert('无需修改');
                    return false;
                }
                var post_data="Version[id]="+versionid+"&Version[title]="+title+"&Version[path]="+code_path+'&Version[descp]='+descp;
                $.ajax({
                    type:"post",
                    url:'/version/save',
                    data:post_data,
                    success:function(result){
                        if(result.code!=0){
                            $('#change_message').html('修改失败');
                        }else{
                            obj.parent().prevAll().eq(1).html(result.data);
                            obj.parent().prevAll().eq(3).html(descp);
                            obj.parent().prevAll().eq(4).html(title);
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
        var versionid=$(this).attr('data'),obj= $(this);
        if(versionid){
            $.ajax({
                type:"post",
                url:'/version/lock',
                data:'lock=0&versionid='+versionid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('no');
                        obj.removeClass('forbiden btn-danger').addClass('enabled btn-primary').text('启用');
                    }
                }
            });
        }
    });

    //启用
    $(document).on('click','#list .enabled',function(){
        var versionid=$(this).attr('data'),obj= $(this);
        if(versionid){
            $.ajax({
                type:"post",
                url:'/version/lock',
                data:'lock=1&versionid='+versionid,
                success:function(result){
                    if(result.code==0){
                        obj.parent().prev().html('<em class="version_active">releases</em>');
                        obj.removeClass('enabled btn-primary').addClass('forbiden btn-danger').text('关闭');
                    }
                }
            });
        }
    });
    
    //添加
    $('#managementSys #list .add button').on('click',function(){
        $('#add,#mark').show();
        $('#add_form .version-file').on("fileuploaded", function (event, data, previewId, index) {
            var res=data.response;
            if(res.code==0){
                $('#add_form #addversionFile').val(data.response.data);
            }
        });
        $("#add_form").validate({
            rules:{
                versionTitle:{required:true,rangelength:[1,30]},
                versionDescp:{maxlength:150}
            },
            messages:{
                versionTitle:{required:"标题必填",rangelength:"标题需1-30个字符"},
                versionDescp:{maxlength:"输入字符已超过150"}
            },
            submitHandler: function() {
                var title=$('#add_form #version-title').val();
                var code_path=$('#add_form #addversionFile').val();
                var descp=$('#add_form #version_descp').val();
                if(code_path==''){
                    alert('没传压缩文件');
                    return false;
                }
                var post_data="Version[title]="+title+"&Version[path]="+code_path+"&Version[descp]="+descp;
                $.ajax({
                    type:"post",
                    url:'/version/add',
                    data:post_data,
                    success:function(result){
                        if(result.code!=0){
                            $('#add_message').html('添加失败');
                        }
                    },
                    complete:function(){
                        $('#add,#mark').hide();
                        window.location.href="/version";
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#add_message"
        });
    });
    $('.version-file').fileinput({
        language: 'zh',
        uploadUrl:'/version/upload',
        maxFilesNum: 1,
        showUpload:true,
        showRemove : true,
        showCaption:true,
        maxFileCount:1,
        showPreview:false,
        autoReplace:true
    });
    $('.version-file').on('filebrowse', function(event) {
        $('.error-message').html('');
    });
    $('.version-file').on("filebatchselected", function (event,files) {
        var file=files[0];
        var fileSize=file.size;
        var ext=file.type.split('/')[1];
        var maxSize = 70*1024*1024;
        if(fileSize > maxSize){
            $('.error-message').html('文件应在70M以内');
            return false;
        }
    });
    $('.version-file').on('filecleared', function(event) {
        $('.error-message').html('');
    });
    request(thisPageUrl);
    //跳页
    $addPage();
});