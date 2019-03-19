###书籍相关api
####书籍列表(list)
*`url`*:/api/book/list
*`method`*:post
*`headers`*:X-token
<font color="blue">`return`</font>:
```javascript
{
    code:0,        //0表示成功,其它数字表示失败,失败时data是null
    msg:'success', //提示的信息
    data:[
       {id:'book_1',name:'book1',lasted:'时间戳'},//lasted:最后更新的时间
       {id:'book_2',name:'book2',lasted:'时间戳'},
    ]
}
```
####新增书籍(add)
*`url`*:/api/book/add
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Book[name]:`string`,书籍名
* Book[target]:`numeric`,目标字数
* Book[descp]:`string`,书籍简介描述,0-150个字符

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:{
        source:source,      //email_title,用户邮箱_书籍名利用加密算法加密过的字符串
        id:crypted,         //book_1,以'book_'为前缀
        lasted:created      //最后更新时间
    }
}
```
####获取单本书籍信息(getbook)
*`url`*:/api/book/getbook
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:[
        {
            id:book_id,
            name:name,
            descp:descp,
            lasted:lasted,
            target:target
        }
    ]
}
```
####修改单本书籍(save)
*`url`*:/api/book/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Book[id]:`string`,book_书籍id,如book_1,以'book_'为前缀
* Book[name]:`string`,非必需项
* Book[target]:`numeric`,非必需项
* Book[descp]:`string`,非必需项

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:[{id:book_id,lasted:lasted,type:'book'}]//lasted:最后更新时间
}
```
####删除书籍(delete)
*`url`*:/api/book/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success'           //提示的信息
}
```
