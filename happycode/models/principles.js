/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-02-21 16:02:40
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Principles = sequelize.define("Principles",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		authorid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue:0
		},
		bookid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue:0
		},
		class:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment: "大纲分类"
		},
		data_path:{
			type:DataTypes.STRING(100),
			comment: "数据路径"
		},
		size:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment: "数据大小"
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "大纲状态"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
		lasted:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "修改时间",
			defaultValue:0
		}
	},
	{
		tableName:'principles',
		timestamps: false,
		hooks:{
			beforeCreate:function(principles,options){
				var now=Date.now();
				principles.created=now;
				principles.lasted=now;
			}
		}
	});
	return Principles;
};
