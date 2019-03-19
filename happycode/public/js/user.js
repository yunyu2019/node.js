var nowPage=1,maxPage,request,thisPageUrl = '/user/list',flag=true;
$(function(){
    request = function(url,page){
        $.get(url,{p:page?page:1},function(data){
            var res=data.data;
            $('#managementSys #list table tbody').html('').append(function(){
                var list,datas=res.data;
                for(var i=0,len=datas.length; i<len; i++) {
                    list +=
                        "<tr>" +
                        "<td>"+datas[i].email+"</td>" +
                        "<td>"+datas[i].name+"</td>" +
                        "<td>"+moment(datas[i].created).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+moment(datas[i].last_time).format('YYYY-MM-DD HH:mm:ss.SSS')+"</td>" +
                        "<td>"+datas[i].active+"</td>" +
                        "<td class='operation'>"+
                        "<button type='button' class='change btn btn-primary' data='"+datas[i].id+"'>修改</button>"+ "&nbsp;";
                    if(datas[i].status==1){
                        list+="<button type='button' class='forbiden btn btn-danger' data='"+datas[i].email+"'>删除</button>";
                    }else{
                        list+="<button type='button' class='enabled btn btn-danger' data='"+datas[i].email+"'>恢复</button>";
                    }
                    list+="</td><tr>";
                }
                return list;
            });
            maxPage = res.pageCount;
            if(flag){
                //初始化分页
                $pagination(maxPage);
            }
        });
    };
    $('#mark').css({'width':$(window).width(),'height':$(window).height()});
    $('#add').css('left',$(window).width()/2-($('#add').width()+100)/2);
    $('#change').css('left',$(window).width()/2-($('#change').width()+100)/2);
    $.validator.addMethod("checkPass", function(value,element,params){
    var checkPass =/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;  return this.optional(element)||(checkPass.test(value));},'密码格式错误');
    //修改
    $(document).on('click','#managementSys #list .change', function () {
        $('#change,#mark').show();
        var obj=$(this);
        var userid=$(this).attr('data'),nicename=obj.parent().prevAll().eq(3).html();
        $('#change_form #userName').val(nicename);
        $("#change_form").validate({
            rules:{
                userName:{required:true,rangelength:[1,30]},
                userPwd:{checkPass:true}
            },
            messages:{
                userName:{required:"用户名必填",rangelength:"用户长度需1-30个字符"}
            },
            submitHandler: function() {
                var name=$('#change_form  #userName').val();
                var pass=$('#change_form #userPwd').val();
                if(name==nicename && pass==''){
                    alert('无需修改');
                    return false;
                }
                var post_data="User[name]="+name+"&User[id]="+userid;
                if(pass!=''){
                    post_data+='&User[pwd]='+pass;
                }
                $.ajax({
                    type:"post",
                    url:'/user/save',
                    data:post_data,
                    success:function(result){
                        if(result.code==0){
                            obj.parent().prevAll().eq(3).html(name);
                        }else{
                            $('#change_message').html('修改失败');
                        }
                    },
                    complete:function(){
                        $('#change_form #userPwd').val('');
                        $('#change,#mark').hide();
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#change_message"
        });
    });
    //删除
    $(document).on('click','#managementSys #list .forbiden',function () {
        var email=$(this).attr('data');
        var obj=$(this);
        if(email){
            $.ajax({
                    type:"post",
                    url:'/user/lock',
                    data:'lock=0&email='+email,
                    success:function(result){
                        if(result.code==0){
                            obj.parent().prev().html('禁用');
                            obj.removeClass('forbiden').addClass('enabled').text('恢复');
                        }
                    }
            });
        }
    });
    //恢复
    $(document).on('click','#managementSys #list .enabled',function () {
        var email=$(this).attr('data');
        var obj=$(this);
        if(email){
            $.ajax({
                    type:"post",
                    url:'/user/lock',
                    data:'lock=1&email='+email,
                    success:function(result){
                        if(result.code==0){
                            obj.parent().prev().html('启用');
                            obj.removeClass('enabled').addClass('forbiden').text('删除');
                        }
                    }
            });
        }
    });

    //添加账户
    $('#managementSys #list .add button').on('click', function () {
        $('#add,#mark').show();
        $("#add_form").validate({
            rules:{
                userName:{required:true,rangelength:[1,30]},
                userEmail:{required:true,email:true},//,remote:"/user/checkEmail"},
                userPwd:{required:true,checkPass:true}
            },
            messages:{
                userName:{required:"用户名必填",rangelength:"用户长度需1-30个字符"},
                userEmail:{required:"邮箱必填",email:"邮箱格式错误"},//remote:'邮箱已存在'}
                userPwd:{required:"密码必填"}

            },
            submitHandler: function() {
                var name=$('#user-name').val();
                var email=$('#user-email').val();
                var pass=$('#user-pwd').val();
                $.ajax({
                    type:"post",
                    url:'/user/add',
                    data:"User[name]="+name+"&User[email]="+email+"&User[pwd]="+pass,
                    success:function(result){
                        if(result.code==0){
                            window.location.href="/user";
                        }else{
                            $('#add_message').html('添加失败');
                        }
                    },
                    complete:function(){
                        $('#add,#mark').hide();
                        window.location.href="/user";
                    }
                });
            },
            errorElement:"p",
            errorLabelContainer: "#add_message"
        });
    });

    request(thisPageUrl);
    $addPage();
});