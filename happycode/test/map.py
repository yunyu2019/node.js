#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Date    : 2016-12-20 18:40:20
# @Author  : Yunyu2019 (yunyu2010@yeah.net)
# @Link    : 
# @descp   : The document description

import os
import json
import codecs
import requests
import ConfigParser

class Maps(object):
	"""docstring for Book"""
	def __init__(self,headers):
		self.headers=headers
		self.getConfig()
		self.source='http://{0}:{1}/{2}'.format(self.config['Site']['url'],self.config['Site']['port'],'api/map')
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
		print 'map list'
		bookid=raw_input('please input the book id:')
		url='{0}/{1}'.format(self.source,'list')
		data={
			'bookid':bookid
		}
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print cont

	def add(self):
		print 'map add'
		bookid=raw_input('please input the book id:')
		title=raw_input('please input the map title:')
		img_path=raw_input('please input the map file path:')
		data={
			'bookid':bookid,
			'title':title,
			'imgbase':''
		}
		cont=''
		with codecs.open(img_path,'r',encoding='utf-8') as fs:
			cont=fs.read()
		cont='data:image/{0};base64,{1}'.format(self.extensions,cont)
		data['imgbase']=cont
		url='{0}/{1}'.format(self.source,'create')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def save(self):
		print 'map save'
		mapid=raw_input('please input the map id:')
		title=raw_input('please input the map title:')
		imgpath=raw_input('please input the map image path:')
		data={
			'mapid':mapid
		}
		if(title=='' and imgpath==''):
			print 'no params'
			exit()
		if(title):
			data['title']=u'{0}'.format(title)
		if(imgpath):
			if( not os.path.exists(imgpath)):
				print 'image path error'
				exit()
			else:
				cont=''
				with codecs.open(imgpath,'r',encoding='utf-8') as fs:
					cont=fs.read()
				cont='data:image/{0};base64,{1}'.format(self.extensions,cont)
				data['imgbase']=cont
		url='{0}/{1}'.format(self.source,'save')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def getOne(self):
		print 'map info'
		mapid=raw_input('please input the map id:')
		data={
			'mapid':mapid
		}
		url='{0}/{1}'.format(self.source,'info')
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		item=json.loads(cont)
		with codecs.open('info.log','w',encoding='utf-8') as fp:
			fp.write("id:{0}\n".format(item['data']['id']))
			fp.write("title:{0}\n".format(item['data']['title']))
			fp.write("lasted:{0}\n".format(item['data']['lasted']))
			fp.write("imgbase:{0}".format(item['data']['imgdata']))
		print len(item['data']['imgdata'])

	def delete(self):
		print 'map delete'
		mapid=raw_input('please input the map id:')
		data={
			'mapid':mapid
		}
		url='{0}/{1}'.format(self.source,'delete')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content


if __name__ == '__main__':
	headers={
	'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
	}
	"""
	with codecs.open('token.txt','r',encoding="utf-8") as fp:
		for line in fp.readlines():
			token=line
	headers['X-token']=token
	"""
	map=Maps(headers)
	map.getlist()