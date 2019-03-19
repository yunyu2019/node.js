-- MySQL dump 10.13  Distrib 5.5.47, for Win32 (x86)
--
-- Host: localhost    Database: app
-- ------------------------------------------------------
-- Server version	5.5.47-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `article`
--

DROP TABLE IF EXISTS `article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `article` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '文章标题',
  `cateid` int(10) unsigned DEFAULT '0' COMMENT '栏目id',
  `author` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '作者',
  `created` bigint(20) unsigned DEFAULT '0',
  `lasted` bigint(20) unsigned DEFAULT '0',
  `status` tinyint(1) unsigned DEFAULT NULL,
  `content` text CHARACTER SET utf8,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `books` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `author_id` int(11) unsigned DEFAULT NULL,
  `created` bigint(20) unsigned DEFAULT '0' COMMENT '加入时间',
  `lasted` bigint(20) unsigned DEFAULT '0' COMMENT '书相关最后修改时间',
  `edited` bigint(20) unsigned DEFAULT '0' COMMENT '书名修改时间',
  `status` tinyint(1) unsigned DEFAULT '1' COMMENT '1:正常 0:删除',
  `descp` varchar(200) CHARACTER SET utf8 DEFAULT NULL COMMENT '书籍简介',
  `target` int(10) unsigned DEFAULT '0' COMMENT '目标字数,(万)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `pid` int(10) unsigned DEFAULT '0' COMMENT '父级id',
  `level` int(10) unsigned DEFAULT NULL,
  `created` bigint(20) unsigned DEFAULT NULL,
  `status` tinyint(1) unsigned DEFAULT '1' COMMENT '1:正常 0:已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chapter`
--

DROP TABLE IF EXISTS `chapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chapter` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '书籍id',
  `authorid` int(10) unsigned DEFAULT '0' COMMENT '作者id',
  `volumnid` int(10) unsigned DEFAULT NULL COMMENT '卷id',
  `name` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '节点名称',
  `created` bigint(20) unsigned DEFAULT '0' COMMENT '加入时间',
  `lasted` bigint(20) unsigned DEFAULT '0' COMMENT '最后一次修改时间',
  `sort` int(10) unsigned DEFAULT '0' COMMENT '排序id',
  `status` tinyint(1) unsigned DEFAULT '1',
  `counts` int(10) unsigned DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `content` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `chapterid` int(10) unsigned DEFAULT NULL,
  `content` text CHARACTER SET utf8 COMMENT '文章内容',
  `created` bigint(20) unsigned DEFAULT '0',
  `lasted` bigint(20) unsigned DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `focus`
--

DROP TABLE IF EXISTS `focus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `focus` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8 DEFAULT NULL COMMENT '标题',
  `imgsrc` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '图片地址',
  `descp` varchar(200) CHARACTER SET utf8 DEFAULT NULL COMMENT '图片描述',
  `is_active` tinyint(1) unsigned DEFAULT '0' COMMENT '是否对外显示',
  `created` bigint(20) unsigned DEFAULT '0' COMMENT '加入时间',
  `sort` int(10) unsigned DEFAULT '0' COMMENT '对外排序id',
  `url` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hook_class`
--

DROP TABLE IF EXISTS `hook_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hook_class` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `created` bigint(20) unsigned DEFAULT NULL,
  `status` tinyint(1) unsigned DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hooks`
--

DROP TABLE IF EXISTS `hooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hooks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '插件名称',
  `class` int(10) unsigned DEFAULT '0' COMMENT '插件分类',
  `link` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '插件下载地址',
  `description` varchar(200) CHARACTER SET utf8 DEFAULT NULL COMMENT '描述',
  `status` tinyint(1) unsigned DEFAULT '1' COMMENT '删除状态:1.正常,0:已删除',
  `created` bigint(20) unsigned DEFAULT '0' COMMENT '加入时间',
  `sources` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '来源',
  `downs` int(10) unsigned DEFAULT '0' COMMENT '安装量',
  `downstr` char(80) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maps`
--

DROP TABLE IF EXISTS `maps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maps` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookid` int(10) unsigned NOT NULL,
  `authorid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `title` varchar(50) CHARACTER SET utf8 DEFAULT '' COMMENT '地图名称',
  `imgsrc` varchar(100) CHARACTER SET utf8 DEFAULT '' COMMENT '地图路径',
  `size` int(10) unsigned DEFAULT '0',
  `created` bigint(20) unsigned DEFAULT '0' COMMENT '加入时间',
  `lasted` bigint(20) unsigned DEFAULT '0' COMMENT '修改时间',
  `status` tinyint(1) unsigned DEFAULT '1' COMMENT '状态 1:正常 0:已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `members` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nicename` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8 NOT NULL,
  `pwd` char(80) DEFAULT NULL,
  `status` tinyint(1) unsigned DEFAULT '1',
  `reg_time` bigint(20) unsigned DEFAULT '0',
  `last_time` bigint(20) unsigned DEFAULT '0',
  `online` tinyint(1) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `plays`
--

DROP TABLE IF EXISTS `plays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plays` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `imgsrc` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `sort` int(10) unsigned DEFAULT '0',
  `created` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) unsigned DEFAULT '0',
  `descp` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `url` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT 'url链接地址',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pspectrum`
--

DROP TABLE IF EXISTS `pspectrum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pspectrum` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookid` int(10) unsigned NOT NULL DEFAULT '0',
  `authorid` int(10) unsigned NOT NULL DEFAULT '0',
  `title` varchar(50) CHARACTER SET utf8 DEFAULT '' COMMENT '人物谱标题',
  `imgsrc` varchar(100) CHARACTER SET utf8 DEFAULT '' COMMENT '图片路径',
  `size` int(10) unsigned DEFAULT '0',
  `status` tinyint(3) unsigned DEFAULT '1' COMMENT '状态 0:已删除 1:正常',
  `extras` text CHARACTER SET utf8 DEFAULT '' COMMENT '额外数据',
  `created` bigint(20) unsigned DEFAULT '0',
  `lasted` bigint(20) unsigned DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='人物谱';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(50) CHARACTER SET utf8 NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `pwd` char(80) CHARACTER SET utf8 DEFAULT NULL,
  `last_time` bigint(20) unsigned DEFAULT '0',
  `status` tinyint(1) unsigned DEFAULT '1',
  `created` bigint(20) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `versions`
--

DROP TABLE IF EXISTS `versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `versions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(50) CHARACTER SET utf8 DEFAULT NULL,
  `descp` varchar(150) CHARACTER SET utf8 DEFAULT NULL COMMENT '版本特性',
  `created` bigint(20) unsigned DEFAULT NULL,
  `path` varchar(100) DEFAULT NULL,
  `url` varchar(100) CHARACTER SET utf8 DEFAULT NULL COMMENT '下载字符',
  `is_last` tinyint(1) unsigned DEFAULT '0' COMMENT '0:否 1:最新',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `volumn`
--

DROP TABLE IF EXISTS `volumn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `volumn` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '书籍id',
  `authorid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '作者id',
  `name` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `created` bigint(20) unsigned DEFAULT NULL,
  `edited` bigint(20) unsigned DEFAULT '0',
  `sort` int(10) unsigned DEFAULT '0' COMMENT '排序id',
  `status` tinyint(1) unsigned DEFAULT '1' COMMENT '1:正常 0:删除',
  `lasted` bigint(20) unsigned DEFAULT '0' COMMENT '卷相关最后修改时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `principles`
--

DROP TABLE IF EXISTS `principles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `principles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookid` int(10) unsigned NOT NULL DEFAULT '0',
  `authorid` int(10) unsigned NOT NULL DEFAULT '0',
  `class` int(10) unsigned DEFAULT '0' COMMENT '大纲分类',
  `data_path` varchar(100) CHARACTER SET utf8 DEFAULT '' COMMENT '数据路径',
  `size` int(10) unsigned DEFAULT '0',
  `created` bigint(20) unsigned DEFAULT '0',
  `lasted` bigint(20) unsigned DEFAULT '0',
  `status` tinyint(1) unsigned DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='大纲';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-02-27 10:15:50
