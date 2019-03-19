var $ajax = function(url,data,callback,type,dataType){
    var type = type?type:'get';
    var data = data?data:'';
    var dataType = dataType?dataType:'json';
    return $.ajax({
        url:url,
        data:data,
        type:type,
        dataType:dataType
    });
};