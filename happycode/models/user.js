/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 11:23:46
 * @version $Id$
 */
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
	var User = sequelize.define("User",{
		id:{
			type:DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		name:{
			type:DataTypes.STRING(50),
			comment: "昵称"
		},
		email:{
			type:DataTypes.STRING(50),
			allowNull: false,
			comment: "邮箱"
		},
		pwd:{
			type:DataTypes.STRING(80),
			comment: "密码"
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "用户状态"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
		last_time:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "上次登陆时间",
			defaultValue:0
		}
	},
	{
		tableName:'users',
		timestamps: false,
		hooks:{
			beforeCreate:function(user,options){
				user.created=Date.now();
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(user.pwd,salt);
				user.pwd=hash;
			}
		},
		getterMethods:{
			active:function(){return this.status?'启用':'禁用';}
		}
	});
	return User;
};
