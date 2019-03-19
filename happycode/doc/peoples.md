###人物谱相关api
####获取人物谱同步列表
*`url`*:/api/people/list
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
        {id:"people_1",title:"people1",lasted:""},
        {id:"people_2",title:"people2",lasted:""}
    ]
}
```
####新增人物谱
*`url`*:/api/people/create
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀
* title:`string`,人物谱标题
* imgbase:`string`,图片base64,
* extras:`string`,额外json信息

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'people_1',
        lasted:lasted,
        source:source       //email_bookid_people_title利用加密算法加密的字符串,例如yunyu2010@yeah.net_book_1_people_people1222
    }
}
```
####修改人物谱
*`url`*:/api/people/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* peopleid:`string`,people_人物谱id,如people_1,以'people_'为前缀
* title:`string`,人物谱标题
* imgbase:`string`,图片base64,
* extras:`string`,额外json信息

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'people_1',
        lasted:lasted
    }
}
```
####获取单条人物谱记录
*`url`*:/api/people/info
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* peopleid:`string`,people_人物谱id,如people_1,以'people_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'people_1',
        title:'people1',
        lasted:lasted,
        imgdata:'',         //图片base64
        extras:''           //额外json信息
    }
}
```
####删除单条人物谱记录
*`url`*:/api/people/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* peopleid:`string`,people_人物谱id,如people_1,以'people_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:{
        id:'people_1',
        lasted:lasted
    }
}
```