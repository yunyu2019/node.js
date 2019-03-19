/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 11:27:26
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Version = sequelize.define("Version",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		title:{
			type:DataTypes.STRING(50),
			comment: "标题"
		},
		descp:{
			type:DataTypes.STRING(150),
			comment: "版本特性描述"
		},
		path:{
			type:DataTypes.STRING(100),
			comment: "版本路径"
		},
		url:{
			type:DataTypes.STRING(100),
			comment: "下载字符串"
		},
		is_last:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "releases"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
	},
	{
		tableName:'versions',
		timestamps: false,
		hooks:{
			beforeCreate:function(version,options){
				version.created=Date.now();
			}
		},
		getterMethods:{
			releases:function(){return this.is_last?'releases':'no';}
		}
	});
	return Version;
};
