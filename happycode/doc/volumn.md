###卷相关api
####卷列表(list)
*`url`*:/api/volumn/list
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀
* t:`string`,值:sync,加上t以后列表数据只返回id,lasted

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:[
        {id:'volumn_1',name:'volumn1',lasted:'时间戳',sort:''},
        {id:'volumn_2',name:'volumn2',lasted:'时间戳',sort:''}
    ]
}
```
####新增卷(add)
*`url`*:/api/volumn/add
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Volumn[bookid]:`string`,书籍id,如book_1,以'book_'为前缀
* Volumn[name]:`string`,卷名称,1-20个字符

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            source:source,  //email_书籍名称_卷名使用加密算法生成的字符串
            id:'volumn_1',
            lasted:lasted,
            type:'volumn'
        },
        {type:'book',id:bookid,lasted:book_last}
    ]
}
```
####获取单卷信息(info)
*`url`*:/api/volumn/info
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* volumnid:`string`,volumn_卷id,如volumn_1,以'volumn_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:volumn_id,
            name:name,
            lasted:lasted,
        }
    ]
}
```
####修改单卷信息(save)
*`url`*:/api/volumn/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Volumn[id]:`string`,卷id,如volumn_1,以'volumn_'为前缀
* Volumn[name]:`string`,卷名称,1-20个字符

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'volumn_1',
            lasted:lasted,
            type:'volumn'
        },
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####删除单卷信息(delete)
*`url`*:/api/volumn/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* volumnid:`string`,volumn_卷id,如volumn_1,以'volumn_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####获取书所有相关的卷章信息
*`url`*:/api/volumn/sync
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
        {
            type:'volumn',
            data:[
               {id:'volumn_1',name:'volumn1',lasted:'时间戳'},
               {id:'volumn_2',name:'volumn2',lasted:'时间戳'}
            ]
        },
        {
            type:'chapter',
            data:[
               {id:'chapter_1',name:'chapter2',lasted:'时间戳'},
               {id:'chapter_2',name:'chapter12',lasted:'时间戳'}
            ]
        }
    ]
}
```