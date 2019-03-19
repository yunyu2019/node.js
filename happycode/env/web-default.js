/**
* 
* @authors Yunyu2019 (yunyu2010@yeah.net)
* @date    2017-01-05 11:42:35
* @version $Id$
*/
module.exports = {
	mysql: {
		user: 'root',
		password: '123456',
		database:'app',
		options:{
			port: 3306,
			dialect:"mysql",
			host: '127.0.0.1',
			/*dialectOptions:{
				socketPath: "/var/run/mysqld/mysqld.sock"
			},*/
			//logging:null
		}
	},
	redis: {
		host: '127.0.0.1',
		db: 0,
		port: 6379,
		auth:'123456'
	},
	email: {
		sendService: '',
		host:'smtp.yeah.net',
		port:25,
		secure:false,
		sendMailer: 'yunyu2010@yeah.net',
		sendMailPass:'*******',
		debug:true
	}
}
