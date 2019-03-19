###会员相关api
####注册(register)
*`url`*:/api/user/register
*`method`*:post
<font color="red">`params`</font>:

* User[email]:`string`,用户邮箱
* User[pwd]:`string`,用户密码,6-12位,数字字母组合,/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/
* User[nicename]:`string`,用户昵称

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败
    msg:'',                 //提示的信息
    data:null               //返回数据
}
```
####登陆(login)
*`url`*:/api/user/login
*`method`*:post
<font color="red">`params`</font>:

* User[email]:`string`,用户邮箱
* User[pwd]:`string`,用户密码

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'',                 //提示的信息
    data:{
        nicename:nicename,  //昵称
        email:email,        //邮箱
        last_time:last_time //最后登录时间
    }
}
response header同步返回X-token,请求有登录验证的接口使用，使用方法:在request header设置
X-token
```
####修改密码(editpass)--成功登录
*`url`*:/api/user/editpass
*`method`*:post
*`headers`*:X-token
<font color="red">`params`</font>:

* User[oldpass]:`string`,用户旧密码
* User[pwd]:`string`,用户密码

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
}
```
####登出(logout)
*`url`*:/api/user/logout
*`method`*:post
*`headers`*:X-token
<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
}
```
####发送验证码
*`url`*:/api/user/token
*`method`*:post
<font color="red">`params`</font>:

* User[email]:`string`,用户邮箱

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
}
```
####检测验证码
*`url`*:/api/user/captcha
*`method`*:post
<font color="red">`params`</font>:

* User[token]:`string`,邮箱中的验证码

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示成功,其它数字表示失败,失败时data是null
    msg:'success',          //提示的信息
}
```
####重置密码(setpass)
*`url`*:/api/user/setpass
*`method`*:post
<font color="red">`params`</font>:

* User[pwd]:`string`,用户密码
* User[repwd]:`string`,重复密码

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示正确返回,其它数字表示失败
    msg:'success',          //提示的信息
}
```
####检测邮箱重复
*`url`*:/api/user/check
*`method`*:post
<font color="red">`params`</font>:

* User[email]:`string`,用户邮箱

<font color="blue">`return`</font>:
```javascript
{
    code:0,                 //0表示正确返回,其它数字表示失败
    msg:'success',          //提示的信息
}
```
