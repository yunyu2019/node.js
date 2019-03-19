#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Date    : 2016-12-20 18:40:20
# @Author  : Yunyu2019 (yunyu2010@yeah.net)
# @Link    : 
# @descp   : The document description

import json
import codecs
import requests
import ConfigParser

class Volumn(object):
	"""docstring for Book"""
	def __init__(self,headers):
		self.headers=headers
		self.getConfig()
		self.source='http://{0}:{1}/{2}'.format(self.config['Site']['url'],self.config['Site']['port'],'api/volumn')

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
		print 'volumn list'
		bookid=raw_input('please input the book id:')
		t=raw_input('please input t:')
		url='{0}/{1}'.format(self.source,'list')
		data={
			'bookid':bookid
		}
		if t=='sync':
			data['t']=t
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print cont

	def add(self):
		print 'volumn add'
		bookid=raw_input('please input the book id:')
		name=raw_input('please input the volumn name:')
		data={
			'Volumn[bookid]':bookid,
			'Volumn[name]':name,
		}
		url='{0}/{1}'.format(self.source,'add')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def save(self):
		print 'volumn save'
		volumnid=raw_input('please input the volumn id:')
		name=raw_input('please input the volumn name:')
		data={
			'Volumn[id]':volumnid,
			'Volumn[name]':u'{0}'.format(name)
		}
		url='{0}/{1}'.format(self.source,'save')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def getOne(self):
		print 'volumn info'
		volumnid=raw_input('please input the volumn id:')
		data={
			'volumnid':volumnid
		}
		url='{0}/{1}'.format(self.source,'info')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def delete(self):
		print 'volumn delete'
		volumnid=raw_input('please input the volumn id:')
		data={
			'volumnid':volumnid
		}
		url='{0}/{1}'.format(self.source,'delete')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def sync(self):
		print 'volumn sync'
		bookid=raw_input('please input the book id:')
		data={
			'bookid':bookid
		}
		url='{0}/{1}'.format(self.source,'sync')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content


if __name__ == '__main__':
	headers={
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
	}
	with codecs.open('cookie.txt','r',encoding="utf-8") as fp:
		for line in fp.readlines():
			cookie=json.loads(line)
	cookie_str=''
	for x in cookie:
		cookie_str='{0}={1}'.format(x,cookie[x])
	headers['Cookie']=cookie_str
	volumn=Volumn(headers)
	volumn.getlist()