###大纲相关api
####获取大纲同步列表
*`url`*:/api/outline/list
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {id:"outline_1",class:"1",lasted:"",size:""},
        {id:"outline_2",class:"2",lasted:"",size:""}
    ]
}
```
####新增大纲
*`url`*:/api/outline/create
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀
* classes:`int`,大纲分类,1-5
* data:`file`,文件类型,文件name就是data

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'outline_1',
        lasted:lasted,
        source:source       //email_bookid_outline_classes利用加密算法加密的字符串,例如yunyu2010@yeah.net_book_1_outline_1
    }
}
```
####修改大纲
*`url`*:/api/outline/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* outlineid:`string`,outline_大纲id,如outline_1,以'outline_'为前缀
* data:`file`,文件类型,文件name就是data

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'outline_1',
        lasted:lasted
    }
}
```
####获取单条大纲记录
*`url`*:/api/outline/info
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* outlineid:`string`,outline_大纲id,如outline_1,以'outline_'为前缀

<font color="blue">`return`</font>:
```
正常情况下返回文件流以供下载,错误时返回json数据,如下:
{
    code:9,                 
    msg:''
}
```
####删除单条大纲记录
*`url`*:/api/outline/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* outlineid:`string`,outline_大纲id,如outline_1,以'outline_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'outline_1',
        lasted:lasted
    }
}
```