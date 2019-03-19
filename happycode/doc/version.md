###版本相关api
####检测版本更新(check)
*`url`*:/api/version/check
*`method`*:get
<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'success',          //提示的信息
    data:'4.0'
}
```
####下载最新版本(releases)
*`url`*:/api/version/releases
*`method`*:get
<font color="blue">`return`</font>:
```
正常下载时返回文件流，否则返回如下json:
{
    code:9,                 //其它数字,表示失败
    msg:'',          //提示的信息
}
```