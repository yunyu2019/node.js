#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Date    : 2016-12-20 18:40:20
# @Author  : Yunyu2019 (yunyu2010@yeah.net)
# @Link    : 
# @descp   : The document description

import os
import json
import time
import codecs
import requests
import ConfigParser

class OutLine(object):
	"""docstring for Book"""
	def __init__(self,headers):
		self.headers=headers
		self.getConfig()
		self.source='http://{0}:{1}/{2}'.format(self.config['Site']['url'],self.config['Site']['port'],'api/outline')
		self.extensions='png'

	def getConfig(self):
		cf = ConfigParser.RawConfigParser()
		cf.read('config.ini')
		sectiones=cf.sections()
		config={}
		for i in sectiones:
			opts=cf.options(i)
			temp={}
			for j in opts:
				temp[j]=cf.get(i,j)
			config[i]=temp
		self.config=config

	def getlist(self):
		print 'outline list'
		bookid=raw_input('please input the book id:')
		url='{0}/{1}'.format(self.source,'list')
		data={
			'bookid':bookid
		}
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print cont

	def add(self):
		print 'outline add'
		bookid=raw_input('please input the book id:')
		classes=raw_input('please input the outline classes:')
		data_path=raw_input('please input the outline data_path:')
		data={
			'bookid':bookid,
			'classes':classes
		}
		if not os.path.exists(data_path):
			print('data_path is error')
			exit()
		url='{0}/{1}'.format(self.source,'create')
		with open(data_path, 'rb') as fs:
			req=requests.post(url,headers=self.headers,data=data,files={'data':fs})
		print req.content

	def save(self):
		print 'outline save'
		url='{0}/{1}'.format(self.source,'save')
		outlineid=raw_input('please input the outline id:')
		data_path=raw_input('please input the outline data path:')
		if(outlineid=='' or data_path==''):
			print 'no params'
			exit()
		data={
			'outlineid':outlineid
		}
		if( not os.path.exists(data_path)):
			print 'data path error'
			exit()
		else:
			with open(data_path,'rb') as fs:
				req=requests.post(url,headers=self.headers,data=data,files={'data':fs})
		print req.content

	def getOne(self):
		print 'outline info'
		outlineid=raw_input('please input the outline id:')
		data={
			'outlineid':outlineid
		}
		url='{0}/{1}'.format(self.source,'info')
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print req.headers
		with open('data.zip','wb') as fp:
			fp.write(cont)
		print('success')

	def delete(self):
		print 'outline delete'
		outlineid=raw_input('please input the outline id:')
		data={
			'outlineid':outlineid
		}
		url='{0}/{1}'.format(self.source,'delete')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content


if __name__ == '__main__':
	headers={
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
	}
	with codecs.open('token.txt','r',encoding="utf-8") as fp:
		for line in fp.readlines():
			token=line
	headers['X-token']=token
	outLine=OutLine(headers)
	outLine.getOne()