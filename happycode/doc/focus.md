###轮播图相关api
####获取轮播图列表(list)
*`url`*:/api/focus/list
*`method`*:get
<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {title:'image1',imgsrc:'',url:'',descp:'',is_active:1},
        {title:'image2',imgsrc:'',url:'',descp:'',is_active:1}
    ]
}
```