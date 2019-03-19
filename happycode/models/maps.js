/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-02-21 16:02:40
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Maps = sequelize.define("Maps",{
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
		title:{
			type:DataTypes.STRING(50),
			comment: "标题"
		},
		imgsrc:{
			type:DataTypes.STRING(100),
			comment: "图片路径"
		},
		size:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment: "图片大小"
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "图片状态"
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
		tableName:'maps',
		timestamps: false,
		hooks:{
			beforeCreate:function(maps,options){
				var now=Date.now();
				maps.created=now;
				maps.lasted=now;
			}
		}
	});
	return Maps;
};
