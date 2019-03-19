###插件相关api
####获取插件列表(list)
*`url`*:/api/hook/list
*`method`*:get
<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {id:'id1',title:'名称1',class:'分类1',sources:'来源1',downs:'下载量1',description:'简介1',downstr:'下载链接'},
        {id:'id',title:'名称',class:'分类',sources:'来源',downs:'下载量',description:'简介',downstr:''}
    ]
}
```
####获取插件详情(detail)
*`url`*:/api/hook/detail
*`method`*:get
<font color="red">`params`</font>:

* id:`string`,插件id

<font color="blue">`return`</font>:
```javascript
{
    code:0,           //其它数字,表示失败
    msg:'success',    //提示的信息
    data:{
         id:result.id,
         title:result.title,
         class:result.class,
         sources:result.sources,
         downs:result.downs,
         description:result.description,
         downstr:result.downstr
     }
}
```
####下载插件(download)
*`url`*:/api/hook/download
*`method`*:get
<font color="red">`params`</font>:

* downstr:`string`,插件下载链接地址

<font color="blue">`return`</font>:
```javascript
正常下载返回文件流，否则返回如下json:
{
    code:9,           //表示失败
    msg:''            //提示的信息
}
```
