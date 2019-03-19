## run application  

### 数据库结构
* 请参照`env/happycode.sql`来创建数据库结构

### 使用pm2  
1. 安装pm2,[请参照官网](http://pm2.keymetrics.io)来安装pm2,具体命令:
`npm install -g pm2`
2. 在项目root目录，参照env目录下的`process-defult.json`来配置**process.json**文件
3. 运行如下命令:`pm2 start process.json`,其它命令请参考官方`wiki`文档

### 使用nginx  
1. 请参照`env/nginx.conf`来配置转发和静态文件文件请求缓存
2. `app.js`中注释掉如下代
```javascript
var favicon = require('serve-favicon');
...
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
...
```
3. 利用nginx来压缩响应的数据，将`app.js`中的如下代码给注释掉:
```javascript
var compression = require('compression');
...
app.use(compression());
...
```