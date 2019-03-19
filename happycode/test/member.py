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

class Member(object):
	"""docstring for ClassName"""
	def __init__(self,headers):
		self.headers = headers
		self.getConfig()
		if self.config['Site']['port']=='80':
			self.source='http://{0}/{1}'.format(self.config['Site']['url'],'api/user')
		else:
			self.source='http://{0}:{1}/{2}'.format(self.config['Site']['url'],self.config['Site']['port'],'api/user')
		
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

	def register(self):
		print 'register'
		email=raw_input('please input the email:')
		nicename=raw_input('please input the nicename:')
		pwd=raw_input('please input the password:')
		data={
			'User[email]':email,
			'User[nicename]':nicename,
			'User[pwd]':pwd
		}
		url='{0}/{1}'.format(self.source,'register')
		print url
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		msg=json.loads(cont)
		for x in msg:
			print msg[x]

	def getToken(self):
		print 'get token'
		email=raw_input('please input the email:')
		data={
			'User[email]':email
		}
		url='{0}/{1}'.format(self.source,'token')
		print url
		req=requests.post(url,headers=self.headers,data=data)
		print req.headers
		cont=req.content
		print cont
		#item=json.loads(cont)
		#print item
		if 'Set-Cookie' in req.headers:
			with open('email-token.txt','w') as fp:
				fp.write(req.headers['Set-Cookie'])

	def checkToken(self):
		print 'check token'
		token=raw_input('please input the token:')
		data={
			'User[token]':token
		}
		headers=self.headers
		if os.path.exists('email-token.txt'):
			with open('email-token.txt','r') as fp:
				email_token=fp.read()
			headers['Cookie']=email_token
		url='{0}/{1}'.format(self.source,'captcha')
		print url
		print headers
		req=requests.post(url,headers=headers,data=data)
		cont=req.content
		print req.headers
		print cont
		if 'Set-Cookie' in req.headers:
			with open('email-token1.txt','w') as fp:
				fp.write(req.headers['Set-Cookie'])

	def resetPass(self):
		print 'reset password'
		pwd=raw_input('please input the password:')
		repwd=raw_input('please input the repassword:')
		data={
			'User[pwd]':pwd,
			'User[repwd]':repwd,
		}
		headers=self.headers
		if os.path.exists('email-token1.txt'):
			with open('email-token1.txt','r') as fp:
				email_token=fp.read()
			headers['Cookie']=email_token
		url='{0}/{1}'.format(self.source,'setpass')
		print url
		req=requests.post(url,headers=headers,data=data)
		cont=req.content
		print req.headers
		print cont

	def login(self):
		print 'login'
		email=raw_input('please input the email:')
		pwd=raw_input('please input the password:')
		data={
			'User[email]':email,
			'User[pwd]':pwd
		}
		url='{0}/{1}'.format(self.source,'login')
		print url
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		msg=json.loads(cont)
		print msg
		print req.headers
		if msg['code']==9:
			print msg
		else:
			print msg['data']
			token=req.headers['X-token']
			with codecs.open('token.txt','w',encoding='utf-8') as fp:
				fp.write(token)

	def checkemail(self):
		print 'checkemail'
		email=raw_input('please input the email:')
		data={
			'User[email]':email
		}
		url='{0}/{1}'.format(self.source,'check')
		req=requests.post(url,headers=self.headers,data=data)
		cont=req.content
		print cont

	def editpass(self):
		print 'editpass'
		oldpwd=raw_input('please input the old password:')
		pwd=raw_input('please input the password:')
		repwd=raw_input('please input the repeat password:')
		headers=self.headers.copy()
		try:
			with codecs.open('token.txt','r',encoding="utf-8") as fp:
				for line in fp.readlines():
					token=line
			headers['X-token']=token
			print headers
			data={
				'User[oldpwd]':oldpwd,
				'User[pwd]':pwd,
				'User[repwd]':repwd
			}
			url='{0}/{1}'.format(self.source,'editpass')
			print url
			req=requests.post(url,headers=headers,data=data)
			cont=req.content
			msg=json.loads(cont)
			if 'code' in msg and msg['code']==0:
				print msg
			else:
				print msg
		except:
			print 'err'
			pass


	def logout(self):
		headers=self.headers.copy()
		try:
			with codecs.open('token.txt','r',encoding="utf-8") as fp:
				for line in fp.readlines():
					token=line
			headers['X-token']=token
			print headers
			url='{0}/{1}'.format(self.source,'logout')
			print url
			req=requests.post(url,headers=headers)
			cont=req.content
			print cont
			msg=json.loads(cont)
			print msg
			if 'code' in msg and msg['code']==0:
				if os.path.exists('token.txt'):
					os.remove('token.txt')
				print 'success logout'
		except:
			pass


if __name__ == '__main__':
	headers={
		'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36'
	}
	member=Member(headers)
	member.getToken()
