#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2017-04-19 10:46:48
# @Author  : Yunyu2019 (yunyu2010@yeah.net)
# @Link    : 
# @descp   : The document description

import os
import time
import redis
import logging
import ConfigParser

class CompareScore(object):
	"""docstring for CleanToken"""
	def __init__(self,configPath):
		super(CompareScore, self).__init__()
		self.currdir=os.path.dirname(os.path.abspath(__file__))
		self.configPath =os.path.join(self.currdir,configPath)
		self.getConfig()
		self.initLogs()
		self.initRedis()

	def getConfig(self):
		cf = ConfigParser.RawConfigParser()
		cf.read(self.configPath)
		sectiones=cf.sections()
		config={}
		for i in sectiones:
			opts=cf.options(i)
			temp={}
			for j in opts:
				temp[j]=cf.get(i,j)
			config[i]=temp
		self.config=config

	def initLogs(self):
		logs_path=os.path.join(self.currdir,self.config['Log']['dir'])
		if not os.path.exists(logs_path):
			os.mkdir(logs_path,0766)
		curr_time=time.localtime()
		currDate=time.strftime('%Y%m%d',curr_time)
		logger=logging.getLogger('info')
		infoFormatter=logging.Formatter('%(asctime)s %(message)s')
		logger.setLevel(logging.INFO)
		infoName='{0}/info_{1}.log'.format(logs_path,currDate)
		infoHandler=logging.FileHandler(infoName,mode='a',encoding='utf-8')
		infoHandler.setFormatter(infoFormatter)
		logger.addHandler(infoHandler)
		self.logs=logger

	def initRedis(self):
		redis_config=self.config['Redis']
		try:
			pool = redis.ConnectionPool(host=redis_config['host'], port=redis_config['port'], db=redis_config['db'],password=redis_config['auth'])
			self.redis_conn = redis.Redis(connection_pool=pool)
		except redis.RedisError as e:
			msg='[Error] redis connect error %s' % str(e)
			self.logs.info(msg)
	
	def run(self,users,streams):
		pipe=self.redis_conn.pipeline(False)
		"""
		user=list()
		stream=list()
		for uid,money in users:
			user.extend([uid,money])
			stream.extend([uid,0])
		pipe.zadd('user',*user)
		pipe.zadd('stream',*stream)
		for k,v in streams:
			pipe.zincrby('stream',k,v)
		pipe.zcard('user')
		pipe.zcard('stream')
		user_count,stream_count=pipe.execute()[-2:]
		print user_count,stream_count
		pipe.zrevrange('user',0,1,withscores=True)
		result=pipe.execute()[-1]
		print result
		"""
		stream=[(uid,0) for uid,money in users]
		pipe.zadd('user',**dict(users))
		pipe.zadd('stream',**dict(stream))
		for k,v in streams:
			pipe.zincrby('stream',k,v)
		pipe.zcard('user')
		pipe.zcard('stream')
		user_count,stream_count=pipe.execute()[-2:]
		print user_count,stream_count
		

if __name__ == '__main__':
	config='./config1.ini'
	"""
	users=[(1,50),(2,100),(3,150)]
	streams=[(1,-50),(1,100),(2,-10),(2,110),(3,-10),(3,110)]
	"""
	users=[("1",50),("2",100),("3",150)]
	streams=[("1",-50),("1",100),("2",-10),("2",110),("3",-10),("3",110)]
	comp=CompareScore(config)
	comp.run(users,streams)
	

