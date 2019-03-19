/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 10:40:13
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Hooks = sequelize.define("Hooks",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		title:{
			type:DataTypes.STRING(50),
			allowNull: false,
			comment: "标题"
		},
		class:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		link:{
			type:DataTypes.STRING(100),
			comment: "插件路径"
		},
		description:{
			type:DataTypes.STRING(200),
			comment: "描述"
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "插件状态"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
		sources:{
			type:DataTypes.STRING(100),
			comment: "插件来源",
		},
		downs:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		downstr:{
			type:DataTypes.STRING(80),
			comment: "下载字符串",
		}
	},
	{
		tableName:'hooks',
		timestamps: false,
		hooks:{
			beforeCreate:function(hooks,options){
				hooks.created=Date.now();
			}
		}
	});
	return Hooks;
};
