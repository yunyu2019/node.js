#!/usr/bin/python
# -*- coding: utf-8 -*-
# @Date    : 2016-12-21 09:56:40
# @Author  : Yunyu2019 (yunyu2010@yeah.net)
# @Link    : 
# @descp   : The document description

import json
import codecs
import requests
import ConfigParser

class Chapter(object):
	"""docstring for Book"""
	def __init__(self,headers):
		self.headers=headers
		self.getConfig()
		if self.config['Site']['port']=='80':
			self.source='http://{0}/{1}'.format(self.config['Site']['url'],'api/chapter')
		else:
			self.source='http://{0}:{1}/{2}'.format(self.config['Site']['url'],self.config['Site']['port'],'api/chapter')

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
		print 'chapter list'
		volumnid=raw_input('please input the volumn id:')
		lastid=raw_input('please input last id:')
		url='{0}/{1}'.format(self.source,'list')
		data={
			'volumnid':volumnid
		}
		if lastid:
			data['lastid']=lastid
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print cont

	def add(self):
		print 'chapter add'
		volumnid=raw_input('please input the volumn id:')
		name=raw_input('please input the chapter name:')
		data={
			'Chapter[volumnid]':volumnid,
			'Chapter[title]':name,
		}
		url='{0}/{1}'.format(self.source,'add')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def save(self):
		print 'chapter save'
		chapterid=raw_input('please input the chapter id:')
		name=raw_input('please input the chapter name:')
		data={
			'Chapter[id]':chapterid,
			'Chapter[title]':u'{0}'.format(name)
		}
		url='{0}/{1}'.format(self.source,'save')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def getOne(self):
		print 'info'
		chapterid=raw_input('please input the chapter id:')
		data={
			'chapterid':chapterid
		}
		url='{0}/{1}'.format(self.source,'info')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def getOneFull(self):
		print 'chapter fullinfo'
		chapterid=raw_input('please input the chapter id:')
		data={
			'chapterid':chapterid
		}
		url='{0}/{1}'.format(self.source,'fullinfo')
		req=requests.post(url,headers=self.headers,data=data)
		print req.headers
		cont=req.content
		item=json.loads(cont)
		print len(item['data']['content'])
		"""
		with codecs.open('getcontent','w',encoding='utf-8') as fs:
			fs.write('id:{0}\n'.format(item['data']['id']))
			fs.write('title:{0}\n'.format(item['data']['name']))
			fs.write('content:{0}'.format(item['data']['content']))
		"""

	def saveAll(self):
		print 'saveAll'
		chapterid=raw_input('please input the chapter id:')
		content=raw_input('please input the content path:')
		data={
			'Chapter[id]':chapterid,
			'Chapter[content]':''
		}
		cont=''
		with codecs.open(content,'r',encoding='utf-8') as fs:
			cont=fs.read()
		data['Chapter[content]']=cont
		url='{0}/{1}'.format(self.source,'saveAll')
		print url
		req=requests.post(url,headers=self.headers,data=data)
		print req.headers
		print req.content

	def delete(self):
		print 'chapter delete'
		chapterid=raw_input('please input the chapter id:')
		data={
			'chapterid':chapterid
		}
		url='{0}/{1}'.format(self.source,'delete')
		req=requests.post(url,headers=self.headers,data=data)
		print req.content

	def sync(self):
		print 'chapter sync'
		volumnid=raw_input('please input the volumn id:')
		data={
			'volumnid':volumnid
		}
		url='{0}/{1}'.format(self.source,'sync')
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
	chapter=Chapter(headers)
	chapter.getOneFull()
