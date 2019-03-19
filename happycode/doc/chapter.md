###章节相关api
####获取单卷章列表
*`url`*:/api/chapter/list
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* volumnid:`string`,volumn_卷id,如volumn_1,以'volumn_'为前缀
* lastid:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀,分页使用

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:[
        {id:'chapter_1',name:'chapter1',lasted:'时间戳'},
        {id:'chapter_2',name:'chapter2',lasted:'时间戳'}
    ]
}
```
####新增章节
*`url`*:/api/chapter/add
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Chapter[volumnid]:`string`,卷id,如volumn_1,以'volumn_'为前缀
* Chapter[title]:`string`,章名称,1-30个字符

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            source:source,  //email_卷名称_章名使用加密算法生成的字符串
            id:'chapter_1',
            lasted:lasted,
            type:'chapter'
        },
        {
            id:'volumn_1',
            lasted:volumn_lasted,
            type:'volumn'
        },
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####获取单章信息(info)
*`url`*:/api/chapter/info
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* chapterid:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'chapter_1',
            name:name,
            lasted:lasted
        }
    ]
}
```
####获取单章完整信息(fullinfo)
*`url`*:/api/chapter/fullinfo
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* chapterid:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'chapter_1',
            name:name,
            lasted:lasted,
            content:content
        }
    ]
}
```
####保存章节信息(save)
*`url`*:/api/chapter/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Chapter[id]:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀
* Chapter[title]:`string`,章名称,1-30个字符

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'chapter_1',
            lasted:lasted,
            type:'chapter'
        },
        {
            id:'volumn_1',
            lasted:volumn_lasted,
            type:'volumn'
        },
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####保存章节内容(saveAll)
*`url`*:/api/chapter/saveAll
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* Chapter[id]:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀
* Chapter[content]:`string`,章节内容

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'chapter_1',
            lasted:lasted,
            type:'chapter'
        },
        {
            id:'volumn_1',
            lasted:volumn_lasted,
            type:'volumn'
        },
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####删除章节(delete)
*`url`*:/api/chapter/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* chapterid:`string`,chapter_章id,如chapter_1,以'chapter_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {
            id:'volumn_1',
            lasted:volumn_lasted,
            type:'volumn'
        },
        {type:'book',id:'book_1',lasted:book_last}
    ]
}
```
####获取卷中章节同步信息
*`url`*:/api/chapter/sync
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
        {id:'chapter_1',name:'chapter1',lasted:'时间戳'},
        {id:'chapter_2',name:'chapter2',lasted:'时间戳'}
    ]
}
```
