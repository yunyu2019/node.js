//初始化file-input
function initFileInput(dom,url){
    var dom = $(dom);
    dom.fileinput({
        language: 'zh',
        uploadUrl:url,
        maxFileSize: 2000,
        maxFilesNum: 1,
        showUpload:true,
        showRemove : true,
        showCaption:true,
        maxFileCount:1,
        showPreview:false,
        autoReplace:true
    });
    dom.on('filebrowse', function(event) {
        $('.error-message').html('');
    });
    dom.on("filebatchselected", function (event,files) {
        var file=files[0];
        var fileSize=file.size;
        var ext=file.type.split('/')[1];
        var maxSize = 2*1024*1024;
        var allow=['jpg','jpeg','gif','png'];
        if(fileSize > maxSize){
            $('.error-message').html('图片应在2M以内');
            return false;
        }
        if(allow.indexOf(ext)<=-1){
            $('.error-message').html('图片格式不正确');
            return false;
        }
    });
    dom.on('filecleared', function(event) {
        $('.error-message').html('');
    });
}