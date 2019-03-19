/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 11:07:18
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Content = sequelize.define("Content",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		chapterid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		content:{
			type:DataTypes.TEXT,
			comment: "章内容"
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
		tableName:'content',
		timestamps: false,
		hooks:{
			beforeCreate:function(content,options){
				content.created=Date.now();
			}
		}
	});
	return Content;
};
