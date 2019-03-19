/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 11:20:45
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Plays = sequelize.define("Plays",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		title:{
			type:DataTypes.STRING(100),
			comment: "标题"
		},
		imgsrc:{
			type:DataTypes.STRING(100),
			comment: "图片路径"
		},
		descp:{
			type:DataTypes.STRING(200),
			comment: "描述"
		},
		sort:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment: "排序"
		},
		is_active:{
			type:DataTypes.BOOLEAN,
			defaultValue:0,
			comment: "图片状态"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
		url:{
			type:DataTypes.STRING(100),
			comment: "链接地址"
		}
	},
	{
		tableName:'plays',
		timestamps: false,
		hooks:{
			beforeCreate:function(plays,options){
				plays.created=Date.now();
			}
		},
		getterMethods:{
			active:function(){return this.is_active?'启用中':'已关闭';}
		}
	});
	return Plays;
};
