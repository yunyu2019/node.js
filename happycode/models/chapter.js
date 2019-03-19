/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 10:58:52
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Chapter = sequelize.define("Chapter",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		authorid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		bookid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			defaultValue:0
		},
		volumnid:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		name:{
			type:DataTypes.STRING(100),
			comment: "文章标题",
		},
		sort:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment: "文章排序"
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "文章状态"
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
		counts:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		}
	},
	{
		tableName:'chapter',
		timestamps: false
	});
	return Chapter;
};
