###新玩法相关api
####新玩法图列表(list)
*`url`*:/api/plays/list
*`method`*:get
<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:[
        {title:'image1',imgsrc:'',url:'',is_active:1},
        {title:'image2',imgsrc:'',url:'',is_active:1}
    ]
}
```