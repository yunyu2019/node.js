/**
 * 
 * @authors Yunyu2019 (yunyu2010@yeah.net)
 * @date    2017-01-05 10:52:49
 * @version $Id$
 */
module.exports = function(sequelize, DataTypes) {
	var Book = sequelize.define("Book",{
		id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			autoIncrement: true,
			allowNull: false,
			primaryKey:true
		},
		author_id:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0
		},
		name:{
			type:DataTypes.STRING(100),
			comment: "书籍标题"
		},
		descp:{
			type:DataTypes.STRING(200),
			comment: "书籍简介",
		},
		target:{
			type:DataTypes.INTEGER(11).UNSIGNED,
			defaultValue:0,
			comment:'目标字数'
		},
		status:{
			type:DataTypes.BOOLEAN,
			defaultValue:1,
			comment: "状态"
		},
		created:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "加入时间",
			defaultValue:0
		},
		edited:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "修改时间",
			defaultValue:0
		},
		lasted:{
			type:DataTypes.BIGINT(20).UNSIGNED,
			comment: "相关修改时间",
			defaultValue:0
		},
	},
	{
		tableName:'books',
		timestamps: false
	});
	return Book;
};
