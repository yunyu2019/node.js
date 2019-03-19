var log4js = require('log4js');
log4js.configure(
  {
    appenders: [
      //{type:"stdout"},
      {
        type: "file",
        filename: "logs/error.log",
        maxLogSize: 10*1024*1024, // 10Mb
        numBackups: 5, // keep five backup files
        compress: true, // compress the backups
        encoding: 'utf-8',
        mode: parseInt('0640', 8),
        category:'errors',
        layout:{
          type: 'pattern',
          pattern: "[%d] [pid:%x{pid} %p] %m",
          tokens:{
            pid:function(){return process.pid;}
          }
        }
      },
      {
        type: "dateFile",
        filename: "logs/access.log",
        pattern: "-yyyy-MM-dd",
        compress: true,
        category:'access',
        layout:{
          type: 'pattern',
          pattern: "[%d] [pid:%x{pid} %p] %m",
          tokens:{
            pid:function(){return process.pid;}
          }
        }
      }
    ],
    replaceConsole: true //replace node.js console.log
  }
);
var logger={};
var accesslogger = log4js.getLogger('access');
accesslogger.setLevel('INFO');
logger.access=accesslogger;

var errorlogger = log4js.getLogger('errors');
errorlogger.setLevel('INFO');
logger.errors=errorlogger;

module.exports=logger



