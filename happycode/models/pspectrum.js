/**
 * 人物谱模型
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-02-21 16:02:40
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Pspectrum = sequelize.define("Pspectrum",{
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
		},
		extras:{
			type:DataTypes.TEXT,
			comment: "额外数据"
		}
	},
	{
		tableName:'pspectrum',
		timestamps: false,
		hooks:{
			beforeCreate:function(pspectrum,options){
				var now=Date.now();
				pspectrum.created=now;
				pspectrum.lasted=now;
			}
		}
	});
	return Pspectrum;
};
