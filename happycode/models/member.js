/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 11:16:43
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Member = sequelize.define("Member",{
		id:{
			type:DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		nicename:{
			type:DataTypes.STRING(50),
			comment: "昵称"
		},
		email:{
			type:DataTypes.STRING(50),
			allowNull: false,
			unique: true,
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
		reg_time:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "注册时间",
			defaultValue:0
		},
		last_time:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "上次登陆时间",
			defaultValue:0
		},
		online:{
			type:DataTypes.BOOLEAN,
			defaultValue:0,
			comment: "在线状态"
		}
	},
	{
		tableName:'members',
		timestamps: false,
		hooks:{
			beforeCreate:function(member,options){
				member.reg_time=Date.now();
			}
		}
	});
	return Member;
};
