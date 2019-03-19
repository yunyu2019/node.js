###地图相关api
####获取地图同步列表
*`url`*:/api/map/list
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
        {id:"map_1",title:"map1",lasted:""},
        {id:"map_2",title:"map2",lasted:""}
    ]
}
```
####新增地图
*`url`*:/api/map/create
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* bookid:`string`,book_书籍id,如book_1,以'book_'为前缀
* title:`string`,地图标题
* imgbase:`string`,图片base64

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:{
        id:'map_1',
        lasted:lasted,
        source:source       //email_bookid_maps_title利用加密算法加密的字符串,例如yunyu2010@yeah.net_book_1_maps_map1222
    }
}
```
####修改地图
*`url`*:/api/map/save
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* mapid:`string`,map_地图id,如map_1,以'map_'为前缀
* title:`string`,地图标题
* imgbase:`string`,图片base64

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:{
        id:'map_1',
        lasted:lasted
    }
}
```
####获取单条地图记录
*`url`*:/api/map/info
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* mapid:`string`,map_地图id,如map_1,以'map_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:{
        id:'map_1',
        title:'map1',
        lasted:lasted,
        imgdata:''          //图片base64
    }
}
```
####删除单条地图记录
*`url`*:/api/map/delete
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* mapid:`string`,map_地图id,如map_1,以'map_'为前缀

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
    data:{
        id:'map_1',
        lasted:lasted
    }
}
```