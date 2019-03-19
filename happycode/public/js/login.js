$(function(){
    var warning = $('#warning'),
    login = $('#login form button'), email, pass;
    $('#userName').focus(function(){
        $(this).val('');
        $('#warning').css('display','none');
        $('#warning').text('');
    });
    login.on('click',function(){
        email = $('#userName').val();
        pass = $('#passWord').val();
        $.ajax({
            type:'POST',
            url:'/user/login',
            data:{
                'User[email]':email,
                'User[pwd]':pass
            },
            success:function(result){
                if(result.code>0){
                    $('#warning').text(result.message);
                    $('#warning').css('display','block');
                }else{
                    window.location.href='/user';
                }
            }
        });
    });
});