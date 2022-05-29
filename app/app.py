# coding:utf-8
# !/usr/bin/python

##################################################################################################
# IMPORTS & CONFIGURATION
##################################################################################################

# general module imports
from flask import Flask, render_template, redirect, url_for, request, session, flash
from flask_pymongo import PyMongo
import os, sys, logging
import json
import datetime
import random
import requests
import numpy as np
from bson import json_util
import uuid
from flask_bcrypt import Bcrypt
import re
# import for email service
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
# import for auth0
from functools import wraps
from os import environ as env
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv, find_dotenv
from authlib.flask.client import OAuth
from six.moves.urllib.parse import urlencode
# LEITNER
from . import leitner
from . import leitner_template
#JWT management
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)

# application name within flask = app
app = Flask(__name__)

bcrypt = Bcrypt(app)

# auth0 credentials
oauth = OAuth(app)

auth0 = oauth.register(
    'auth0',
    client_id='yhETaOBUjDsdCyVf1gC7STGL13q6ZcQO',
    client_secret= os.environ.get("AUTH0_CLIENT_SECRET"),
    api_base_url='https://dev-kg-rsfwg.eu.auth0.com',
    access_token_url='https://dev-kg-rsfwg.eu.auth0.com/oauth/token',
    authorize_url='https://dev-kg-rsfwg.eu.auth0.com/authorize',
    client_kwargs={
        'scope': 'openid profile email',
    },
)

# Set the secret key. Keep this really secret!
app.secret_key = os.environ.get("APP_SECRET_KEY")

# JWT config
# default expires in 15 min
# https://flask-jwt-extended.readthedocs.io/en/stable/options/#configuration-options
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
jwt = JWTManager(app)

# server logger for debugging
app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)

##################################################################################################
##################################################################################################


##################################################################################################
# DATABASE CONNECTION
##################################################################################################
# https://flask-pymongo.readthedocs.io/en/latest/
#app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
#https://stackoverflow.com/questions/37945262/authentication-failed-when-using-flask-pymongo
app.config["MONGO_USERNAME"] = os.environ.get("MONGO_USERNAME")
app.config["MONGO_PASSWORD"] = os.environ.get("MONGO_PASSWORD")

print("==========================", app.config["MONGO_URI"])
mongo = PyMongo(app)

##################################################################################################
##################################################################################################

##################################################################################################
# routing
##################################################################################################

@app.route('/index')
@app.route('/')
def index():
	if not session.get('logged_in'):
		return redirect(url_for('login'))
	else:
		return redirect(session['user_role'])

# ACCESS APP
# Redirects user role based pages: admin, distributor, director or teacher
@app.route('/admin')
def admin():
	if not session.get('logged_in'):
		return redirect(url_for('login'))
	else:
		if session['user_role'] != 'admin':
			return redirect(url_for(session['user_role']))
		else:
			print('rendering template admin')
			return render_template(session['user_role']+'.html')

@app.route('/distributor')
def distributor():
	if not session.get('logged_in'):
		return redirect(url_for('login'))
	else:
		if session['user_role'] != 'distributor':
			return redirect(url_for(session['user_role']))
		else:
			print('rendering template distributor')
			return render_template(session['user_role']+'.html')

@app.route('/director')
def director():
	if not session.get('logged_in'):
		return redirect(url_for('login'))
	else:
		if session['user_role'] != 'director':
			return redirect(url_for(session['user_role']))
		else:
			return render_template(session['user_role']+'.html')

@app.route('/teacher')
def teacher():
	if not session.get('logged_in'):
		return redirect(url_for('login'))
	else:
		if session['user_role'] != 'teacher':
			return redirect(url_for(session['user_role']))
		else:
			return render_template(session['user_role']+'.html')

@app.route('/consent')
def consent():
	return render_template('consent.html')

@app.route('/joinclassroom', methods=['GET'])
def student():
	return render_template('joinclassroom.html')

##################################################################################################
##################################################################################################


##################################################################################################
# AUTHENTICATION> login, logout and registration
################################################################################################## 

# EXIT APP
# Kills server side session data and redirects to login page
@app.route('/logout')
def logout():
	# session.clear()
	# Redirect user to logout endpoint
	if 'jwt_payload' in session.keys():
		session.clear()
		#params = {'returnTo': url_for('login', _external=True), 'client_id': 'yhETaOBUjDsdCyVf1gC7STGL13q6ZcQO'}
		params = {'returnTo': os.environ.get("PROTOCOL")+"://"+os.environ.get("DOMAIN")+'/', 'client_id': 'yhETaOBUjDsdCyVf1gC7STGL13q6ZcQO'}
		return redirect(auth0.api_base_url + '/v2/logout?' + urlencode(params))
	else:
		session.pop('logged_in', None)
		session.pop('user_id', None)
		session.pop('user_email', None)
		session.pop('user_pass', None)
		session.pop('user_role', None)
		session.pop('user', None)
		return redirect(url_for('login'))


# AUTHENTICATION PROCESS
# Upon login process sets server side session data and redirects to role based view or retry login if failed
@app.route('/login', methods=['POST','GET'])
def login():
	if not session.get('logged_in'):
		if request.method == 'POST':
			emailCheck = request.form['email']
			userPasswordCheck = request.form['password']
			user = mongo.db.account.find_one( { 'email': emailCheck, 'role': { '$in': ['admin', 'distributor', 'director', 'teacher'] } } )
			if user and 'password' in user.keys():
				pw_hash = user['password']
				check = bcrypt.check_password_hash(pw_hash, userPasswordCheck)
				if check:
					user['_id'] = str(user['_id'])
					session['logged_in'] = True
					session['user_id'] = user['_id']
					session['user_email'] = user['email']
					session['user_pass'] = user['password']
					session['user_role'] = user['role']
					session['user'] = user
					return redirect(url_for(session['user_role']))
				else:
					return render_template('login.html')
			else:
				return render_template('login.html')
		else:
			return render_template('login.html')
	else:
		return redirect(url_for(session['user_role']))

# auth login for teachers admins and directors
@app.route('/loginAuth0')
def loginAuth0():
    return auth0.authorize_redirect(redirect_uri=os.environ.get("PROTOCOL")+'://'+os.environ.get("DOMAIN")+'/callback', audience='https://dev-kg-rsfwg.eu.auth0.com/userinfo')

# Here we're using the /callback route for auth0 teachers,admins and directors.
@app.route('/callback')
def callback_handling():
	# Handles response from token endpoint
	auth0.authorize_access_token()
	resp = auth0.get('userinfo')
	userinfo = resp.json()

	# Store the user information in flask session.
	session['jwt_payload'] = userinfo
	session['profile'] = {
		'user_id': userinfo['sub'],
		'name': userinfo['name'],
		'picture': userinfo['picture']
	}

	user = mongo.db.account.find_one({ 'email': userinfo['email'] })
	if user:
		user['_id'] = str(user['_id'])
		session['logged_in'] = True
		session['user_id'] = user['_id']
		session['user_email'] = user['email']
		#session['user_pass'] = user['password']
		session['user_role'] = user['role']
		session['user'] = user
		return redirect(url_for(session['user_role']))
	##########################################
	else:
		return redirect(url_for('login'))


# this registration is for teachers and directors and distributors that register for the CMS without google openid auth0
@app.route('/register', methods=['POST','GET'])
def register():
	print('on register')
	if request.method == 'POST':
		# this post operation creates a password for a teacher/director/distributor that has been created if they dont use auth0
		hashVal = request.form['hash']
		passwordVal = request.form['passwordA']
		if hashVal and passwordVal:
			pw_hash = bcrypt.generate_password_hash(passwordVal)
			hash_ref = mongo.db.emailHashRef.find_one({ 'hash': hashVal })
			mongo.db.account.find_one_and_update(
				{'email': hash_ref['email']}, 
				{"$set":{
					'password': pw_hash
				}}
			)
			# should this be deleted?
			# mongo.db.emailHashRef.delete_one({ 'hash': hashVal })
			user = mongo.db.account.find_one({ 'email': hash_ref['email'] })
			user['_id'] = str(user['_id'])
			session['logged_in'] = True
			session['user_id'] = user['_id']
			session['user_email'] = user['email']
			# session['user_pass'] = user['password']
			session['user_role'] = user['role']
			session['user'] = user
			# for some reason redirect and render template dows not work here and has to be done on client side
			return redirect(url_for(session['user_role']))
		else:
			return render_template('register.html')
	else:
		return render_template('register.html')


##################################################################################################
##################################################################################################


##################################################################################################
# system API endpoints
##################################################################################################

# read loged in user info
@app.route('/userInfo', methods = ['GET'])
def getUserInfo():
	if session.get('logged_in'):
		userInfo  = {}
		userInfo['user_id'] = session['user_id']
		userInfo['user_email'] = session['user_email']
		userInfo['user_role'] = session['user_role']
		userInfo['user'] = session['user']
		session['user']['password'] = ''
		return json.dumps(userInfo, default=json_util.default)
	else:
		return 'You are not loged in'

# check for unique email availability
@app.route('/checkEmailAvailability/<email>', methods = ['POST'])
def checkUsername(email):
	user = list(mongo.db.account.find({ 'email': email, 'role': { '$in': ['admin', 'distributor', 'teacher', 'director'] } }))
	return json.dumps(len(user), default=json_util.default)

# check for unique school name availability
@app.route('/checkSchoolAvailability/<school>', methods = ['POST'])
def checkSchool(school):
	user = list(mongo.db.school.find({ 'name': school }))
	return json.dumps(len(user), default=json_util.default)

# check for uniwue classroom name within school
@app.route('/checkClassroomAvailability/<classroom>/<school>', methods = ['POST'])
def checkClassroom(classroom,school):
	user = list(mongo.db.classroom.find({ 'name': classroom, 'school':school }))
	return json.dumps(len(user), default=json_util.default)

# for a given invitation hash check user it belongs to via email
@app.route('/getUserEmail/<id>', methods = ['POST'])
def getUserEmail(id):
	user = list(mongo.db.emailHashRef.find({ 'hash': id }))
	return json.dumps(user, default=json_util.default)

# get classroom information for student enrolment
@app.route('/getClassroomInfo/<id>', methods = ['POST'])
def getClassroomInfo(id):
	if id:
		classroom = mongo.db.classroom.find_one({ 'id': id })
		if classroom:
			subscription_limits = mongo.db.subscription.find_one({'school':classroom['school']})
			student_count = mongo.db.account.count_documents({'school': classroom['school'], 'classroom': classroom['id'], 'role':'student'})
			classroom['students'] = student_count
			classroom['studentLimit'] = subscription_limits['studentLimit']
			return json.dumps(classroom, default=json_util.default)
		else:
			return json.dumps({ "data": "Classroom not found" }), 401
	else:
		return json.dumps({ "data": "Missing parameters" }), 422

# create new student
@app.route('/create/student', methods = ['POST'])
def enrollStudent():
	obj = request.json
	if all (k in obj for k in ('studentName', 'studentClassroom', 'studentSchool', 'studentUsername', 'studentPassword', 'guardiamEmail')):
		classroomTarget = mongo.db.classroom.find_one({'school':obj['studentSchool'],'id':obj['studentClassroom']})
		if classroomTarget:
			classroomStudentCount = mongo.db.account.count_documents({'school': obj['studentSchool'], 'classroom': obj['studentClassroom'], 'role':'student'})
			school_subscription = mongo.db.subscription.find_one({'school':obj['studentSchool']})
			schoolStudentSubscriptionLimit = int(school_subscription['studentLimit'])
			if classroomStudentCount < schoolStudentSubscriptionLimit:
				studentId = str(uuid.uuid4())
				uniqueUsername = generateUniqueStudentUsername(obj['studentUsername'])
				mongo.db.account.insert_one({
					'id': studentId,
					'school': obj['studentSchool'],
					'classroom': obj['studentClassroom'],
					'name': obj['studentName'],
					'guardian':obj['guardiamEmail'],
					'username': uniqueUsername,
					'password': obj['studentPassword'],
					'role': 'student'
					})
				mongo.db.player.insert_one({
					'id': studentId,
					'consent': True
					})
				mongo.db.gameState.insert_one({
					'player': studentId
					})	
				student = mongo.db.account.find_one({'id':studentId})
				student['consent'] = [{'consent':False}]
				return 'ok'
			else:
				return json.dumps({ "data": "student limit exceeded" }), 403
		else:
			return json.dumps({ "data": "Classroom not found" }), 404
	else:
		return json.dumps({ "data": "Missing parameters" }), 422

# check for consent status of a student via hash
@app.route('/getConsentStatus/<id>', methods = ['POST'])
def getConsentStatus(id):
	hashRef = mongo.db.consentHash.find_one({ 'hash': id })
	if hashRef:
		student = mongo.db.player.find_one({'id':hashRef['student']})
		status = student['consent']
		return json.dumps(status, default=json_util.default)
	else:
		return 'this student does not exist', 404

# give student consent
@app.route('/giveConsent/<id>', methods = ['POST'])
def giveConsent(id):
	hashRef = mongo.db.consentHash.find_one({ 'hash': id })
	if hashRef:
		student = mongo.db.player.find_one_and_update(
			{'id': hashRef['student']}, 
			{"$set":{
				'consent': True
			}},
			{ 'returnNewDocument' : True }
		)
		status = 'consent granted'
		return json.dumps(status, default=json_util.default)
	else:
		return 'this student does not exist', 404

# revoke student consent
@app.route('/revokeConsent/<id>', methods = ['POST'])
def revokeConsent(id):
	hashRef = mongo.db.consentHash.find_one({ 'hash': id })
	if hashRef:
		student = mongo.db.player.find_one_and_update(
			{'id': hashRef['student']}, 
			{"$set":{
				'consent': False
			}},
			{ 'returnNewDocument' : True }
		)
		status = 'consent revoked'
		return json.dumps(status, default=json_util.default)
	else:
		return 'this student does not exist', 404

# read all service conditions
@app.route('/readServiceConditions', methods=['GET'])
def adminReadDataServiceConditions():	
	service_conditions = mongo.db.serviceConditions.find_one({'language':'English'})
	return json.dumps(service_conditions, default=json_util.default)


##################################################################################################
##################################################################################################


##################################################################################################
# ADMIN API
##################################################################################################

# read operations

# read admins
@app.route('/api/admin/read/admins', methods=['GET'])
def readDataAdmins():
	if session['user_role'] == 'admin':
		users_list  = list(mongo.db.account.find({'role':'admin' }))
		return json.dumps(users_list, default=json_util.default)
	else:
		return 'Access denied'

# read distributors
@app.route('/api/admin/read/distributors', methods=['GET'])
def readDataDistributors():
	if session['user_role'] == 'admin':
		users_list  = list(mongo.db.account.find({'role':'distributor' }))
		return json.dumps(users_list, default=json_util.default)
	else:
		return 'Access denied'

# read schools
@app.route('/api/admin/read/schools', methods=['GET'])
def readDataSchools():
	if session['user_role'] == 'admin':
		# schools_list  = list(mongo.db.school.find())
		schools_list  = list(mongo.db.school.aggregate([
			{
				'$lookup':
					{
						'from': 'subscription',
						'localField': 'id',
						'foreignField': 'school',
						'as': 'subscription'
					}
			}
		]))
		return json.dumps(schools_list, default=json_util.default)
	else:
		return 'Access denied'

# read notifications
@app.route('/api/admin/read/notifications', methods=['GET'])
def readDataNotifications():
	if session['user_role'] == 'admin':
		notifications_list  = list(mongo.db.notification.find())
		return json.dumps(notifications_list, default=json_util.default)
	else:
		return 'Access denied'

# read directors
@app.route('/api/admin/read/directors', methods=['GET'])
def readDataDirectors():
	if session['user_role'] == 'admin':
		users_list  = list(mongo.db.account.aggregate([
			{	'$match':
					{
						'role':'director'
					} 
			},
			{
				'$lookup':
					{
						'from': 'school',
						'localField': 'school',
						'foreignField': 'id',
						'as': 'schoolName'
					}
			}
		]))
		return json.dumps(users_list, default=json_util.default)
	else:
		return 'Access denied'

# read teachers
@app.route('/api/admin/read/teachers', methods=['GET'])
def adminReadDataTeachers():
	if session['user_role'] == 'admin':
		users_list  = list(mongo.db.account.aggregate([
			{	'$match':
					{
						'role':'teacher'
					} 
			},
			{
				'$lookup':
					{
						'from': 'school',
						'localField': 'school',
						'foreignField': 'id',
						'as': 'schoolName'
					}
			}
		]))
		return json.dumps(users_list, default=json_util.default)
	else:
		return 'Access denied'

# read consumers
@app.route('/api/admin/read/consumers', methods=['GET'])
def adminReadDataConsumers():
	if session['user_role'] == 'admin':
		consumers_list  = list(mongo.db.account.find({'role':'consumer' }))
		return json.dumps(consumers_list, default=json_util.default)
	else:
		return 'Access denied'


# check for unique student username availability
@app.route('/api/admin/checkTestStudentUsernameAvailability/<name>/<numberAccounts>/', methods = ['POST'])
def adminCheckTestStudentUsernameAvailability(name, numberAccounts):
	if session['user_role'] == 'admin':
		availability = True
		for i in range(int(numberAccounts)):
			usernameCheck = mongo.db.account.find_one({'username': re.compile('^' + re.escape(name+str(i+1)) + '$', re.IGNORECASE),'role':'student'})
			if usernameCheck:
				availability = False
				break
		return json.dumps(availability, default=json_util.default)
	else:
		return json.dumps({ "data": "Access denied" }), 401

# create operations



# create bulk test student accounts: without consent hash generation sent to guardian
@app.route('/api/admin/create/testStudentAccounts', methods = ['POST'])
def createTestStudentAccounts():
	if session['user_role'] == 'admin':
		obj = request.json
		if all (k in obj for k in ('school', 'guardian', 'accounts', 'classrooms', 'name', 'username', 'password')):
			nAccounts = int(obj['accounts'])
			nClassrooms = int(obj['classrooms'])
			# create classrooms
			for i in range(int(obj['classrooms'])):
				#create classroom
				new_classroom = {}
				new_classroom['id'] = str(uuid.uuid4())
				new_classroom['name'] = str(i+1)
				new_classroom['school'] = obj['school']
				mongo.db.classroom.insert(new_classroom)
				# range limits
				first = int(nAccounts/nClassrooms*i+1)
				last = int((nAccounts/nClassrooms*i+1)+(nAccounts/nClassrooms)-1)
				# print('from '+str(first)+' to '+str(last))
				# create accounts
				for nStudent in range((first), last+1):
					# create accounts
					# print(obj['username']+str(nStudent)+'in classroom '+str(i+1))		
					studentId = str(uuid.uuid4())
					if obj['password']:
						password = ''.join(random.sample('0123456789', 5))
					else:
						password = obj['username']+str(nStudent)
					mongo.db.account.insert_one({
						'id': studentId,
						'school': obj['school'],
						'classroom': new_classroom['id'],
						'name': obj['username']+' '+str(nStudent),
						'guardian':obj['guardian'],
						'username': obj['username']+str(nStudent),
						'password': password,
						'role': 'student'
						})
					mongo.db.player.insert_one({
						'id': studentId,
						'consent': True
						})
					mongo.db.gameState.insert_one({
						'player': studentId
						})	

			return json.dumps({ "data": "Accounts created" }), 200
		else:
			return json.dumps({ "data": "Missing parameters" }), 422
	else:
		return json.dumps({ "data": "Access denied" }), 401

# create admin
@app.route('/api/admin/create/admin', methods = ['POST'])
def createDataAdmin():
	if session['user_role'] == 'admin':
		new_admin = request.json
		emailHashRef = str(uuid.uuid4())		
		sendMail = sendEmailInvitation(new_admin["email"], emailHashRef)
		if sendMail:
			mongo.db.account.insert(new_admin)
			mongo.db.emailHashRef.insert({'email': new_admin["email"], 'hash': emailHashRef})
			return json.dumps(new_admin, default=json_util.default)	
		else:
			return json.dumps({ "data": "operation failed" }), 500
	else:
		return 'Access denied'

# create distributor
@app.route('/api/admin/create/distributor', methods = ['POST'])
def createDataDistributor():
	if session['user_role'] == 'admin':
		new_distributor = request.json
		emailHashRef = str(uuid.uuid4())		
		sendMail = sendEmailInvitation(new_distributor["email"], emailHashRef)
		if sendMail:
			mongo.db.account.insert(new_distributor)
			mongo.db.emailHashRef.insert({'email': new_distributor["email"], 'hash': emailHashRef})
			requests.post(
				os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":new_distributor["email"],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
			return json.dumps(new_distributor, default=json_util.default)	
		else:
			return json.dumps({ "data": "operation failed" }), 500
	else:
		return 'Access denied'

# create school
@app.route('/api/admin/create/school', methods = ['POST'])
def createDataSchool():
	if session['user_role'] == 'admin':
		new_school = request.json
		endDate = new_school['subsriptionEndDate']
		classroomLimit = new_school['classroomLimit']
		studentLimit = new_school['studentLimit']
		del new_school['subsriptionEndDate']
		del new_school['classroomLimit']
		del new_school['studentLimit']
		mongo.db.school.insert(new_school)
		new_subscription = {}
		new_subscription['start'] = str(datetime.datetime.now().date())
		new_subscription['end'] = endDate
		new_subscription['id'] = str(uuid.uuid4())
		new_subscription['school'] = new_school['id']
		new_subscription['classroomLimit'] = classroomLimit
		new_subscription['studentLimit'] = studentLimit
		mongo.db.subscription.insert(new_subscription)

		new_school  = list(mongo.db.school.aggregate([
			{	'$match':
					{
						'id': new_school['id']
					} 
			},
			{	
				'$lookup':
					{
						'from': 'subscription',
						'localField': 'id',
						'foreignField': 'school',
						'as': 'subscription'
					}
			}
		]))
		return json.dumps(new_school[0], default=json_util.default)
	else:
		return 'Access denied'

# create notification
@app.route('/api/admin/create/notification', methods = ['POST'])
def createDataNotification():
	if session['user_role'] == 'admin':
		new_notification = request.json
		mongo.db.notification.insert(new_notification)
		return json.dumps(new_notification, default=json_util.default)
	else:
		return 'Access denied'

# create director
@app.route('/api/admin/create/director', methods = ['POST'])
def createDataDirector():
	if session['user_role'] == 'admin':
		new_director = request.json
		new_director['role'] = 'director'
		emailHashRef = str(uuid.uuid4())
		sendMail = sendEmailInvitation(new_director["email"], emailHashRef, school=new_director['school'])
		if sendMail:
			mongo.db.account.insert(new_director)
			mongo.db.emailHashRef.insert({'email': new_director["email"], 'hash': emailHashRef})
			director  = list(mongo.db.account.aggregate([
				{	'$match':
						{
							'role':'director',
							'email':new_director["email"]
						} 
				},
				{
					'$lookup':
						{
							'from': 'school',
							'localField': 'school',
							'foreignField': 'id',
							'as': 'schoolName'
						}
				}
			]))
			director = director[0]
			# add new director to mailing list accounts
			requests.post(
				os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":new_director["email"],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
			return json.dumps(director, default=json_util.default)
		else:
			return json.dumps({ "data": "operation failed" }), 500
	else:
		return 'Access denied'

# create teacher
@app.route('/api/admin/create/teacher', methods = ['POST'])
def adminCreateDataTeacher():
	if session['user_role'] == 'admin':
		new_teacher = request.json
		new_teacher['role'] = 'teacher'
		emailHashRef = str(uuid.uuid4())
		sendMail = sendEmailInvitation(new_teacher["email"], emailHashRef, school=new_teacher['school'])
		if sendMail:
			mongo.db.account.insert(new_teacher)
			mongo.db.emailHashRef.insert({'email': new_teacher["email"], 'hash': emailHashRef})
			teacher  = list(mongo.db.account.aggregate([
				{	'$match':
						{
							'role':'teacher',
							'email':new_teacher["email"]
						} 
				},
				{
					'$lookup':
						{
							'from': 'school',
							'localField': 'school',
							'foreignField': 'id',
							'as': 'schoolName'
						}
				}
			]))
			teacher = teacher[0]
			# add teacher to mailing list
			requests.post(
				os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":new_teacher["email"],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
			return json.dumps(teacher, default=json_util.default)
		else:
			return json.dumps({ "data": "operation failed" }), 500
	else:
		return 'Access denied'

# create multiple schools and teachers
@app.route('/api/admin/create/multipleSchoolsTeachers', methods = ['POST'])
def multipleSchoolsTeachers():
	if session['user_role'] == 'admin':
		obj = request.json
		items = obj['jsonArr']
		endDate = obj['dateString']
		for item in items:
			schoolCheck = checkSchool(item['school'])
			if schoolCheck == '0':
				new_school = {}
				new_school['id'] = str(uuid.uuid4())
				new_school['name'] = item['school']
				new_school['language'] = item['language']
				mongo.db.school.insert(new_school)
		
				new_subscription = {}
				new_subscription['start'] = str(datetime.datetime.now().date())
				new_subscription['end'] = endDate
				new_subscription['id'] = str(uuid.uuid4())
				new_subscription['school'] = new_school['id']
				mongo.db.subscription.insert(new_subscription)

			target_school = mongo.db.school.find_one({'name':item['school']})
				
			for teacher in item['teachers']:
				teacherCheck = checkUsername(teacher)
				if teacherCheck == '0':
					new_teacher = {}
					new_teacher['id'] = str(uuid.uuid4())
					new_teacher['email'] = teacher
					new_teacher['school'] = target_school['id']
					new_teacher['role'] = 'teacher'
					emailHashRef = str(uuid.uuid4())
					sendMail = sendEmailInvitation(new_teacher["email"], emailHashRef, school=new_teacher['school'])
					if sendMail:
						mongo.db.account.insert(new_teacher)
						mongo.db.emailHashRef.insert({'email': new_teacher["email"], 'hash': emailHashRef})
						# add teacher to mailing list
						requests.post(
							os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
							json={
								"EMAIL":new_teacher["email"],
								"REQUIRE_CONFIRMATION":"no" 
							}
						)
		return 'ok'
	else:
		return 'Access denied'

# create consumers
@app.route('/api/admin/create/consumers', methods = ['POST'])
def adminCreateDataConsumers():
	if session['user_role'] == 'admin':
		consumers = request.json
		for consumer in consumers:
			accountCheck = len(list(mongo.db.account.find({ 'username': re.compile('^' + re.escape(consumer["email"]) + '$', re.IGNORECASE) })))
			if accountCheck == 0:
				sendMail = sendEmailConsumerRegistration(consumer["email"], str(consumer["password"]))
				if sendMail:
					new_consumer = {}
					consumerId = str(uuid.uuid4())
					new_consumer['id'] = consumerId
					new_consumer['username'] = consumer["email"]
					new_consumer['password'] = bcrypt.generate_password_hash(str(consumer["password"]))
					new_consumer['role'] = 'consumer'
					mongo.db.account.insert_one(new_consumer)
					mongo.db.player.insert_one({
						'id': consumerId,
						'consent': True
					})
					# create game state
					mongo.db.gameState.insert_one({
						'player': consumerId
					})
					# add to mailing list
					requests.post(
						os.environ.get('mailtain_api') + "/subscribe/0zT8VH2QI?access_token=" + os.environ.get('mailtain_access_token') + "", 
						json={
							"EMAIL":consumer["email"],
							"REQUIRE_CONFIRMATION":"no" 
						}
					)

		return 'ok'
	else:
		return 'Access denied'

# update operations

# update school
@app.route('/api/admin/update/school', methods = ['POST'])
def adminUpdateSchool():
	if session['user_role'] == 'admin':
		school_ref = request.json

		mongo.db.school.find_one_and_update(
			{'id': school_ref['id']}, 
			{"$set":{
				'name': school_ref['name'],
				'language': school_ref['language']
			}}
		)
		mongo.db.subscription.find_one_and_update(
			{'school': school_ref['id']}, 
			{"$set":{
				'start': school_ref['start'],
				'end': school_ref['end'],
				'classroomLimit': school_ref['classroomLimit'],
				'studentLimit': school_ref['studentLimit']
			}}
		)

		return 'ok', 200
	else:
		return 'Access denied'

# update service conditions
@app.route('/api/admin/update/serviceConditions', methods = ['POST'])
def updateServiceConditions():
	if session['user_role'] == 'admin':
		newConditions = request.json
		mongo.db.serviceConditions.find_one_and_update(
			{'language': 'English'}, 
			{"$set":{
				'version':newConditions['version'],
				'termsOfService':newConditions['termsOfService'],
				'privacyPolicy':newConditions['privacyPolicy'],
				'newsletterConsent':newConditions['newsletterConsent']
			}}
		)
		return 'ok'
	else:
		return 'Access denied'

# delete operations

# delete user(admin, distributor, director or teacher)
@app.route('/api/admin/delete/user/<id>', methods=['POST'])
def deleteUser(id):
	if session['user_role'] == 'admin':
		target_account = mongo.db.account.find_one({ 'id': id })
		mongo.db.emailHashRef.delete_one({ 'email': target_account["email"] })
		mongo.db.acceptedServiceConditions.delete_one({'user': id })
		mongo.db.account.delete_one({ 'id': id })

		if target_account['role'] == 'director' or target_account['role'] == 'teacher' or target_account['role'] == 'distributor':
			requests.post(
				os.environ.get('mailtain_api') + "/unsubscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":target_account["email"],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
		return render_template('admin.html')
	else:
		return 'Access denied'

# delete user(consumer)
@app.route('/api/admin/delete/consumer/<id>', methods=['POST'])
def deleteConsumer(id):
	if session['user_role'] == 'admin':
		consumer = mongo.db.account.find_one({ 'id': id })
		mongo.db.player.delete_one({ 'id': id })
		mongo.db.account.delete_one({ 'id': id })
		mongo.db.gameState.delete_one({ 'player': id })
		mongo.db.leitnerPlayerData.delete_one({'player': id })
		mongo.db.acceptedServiceConditions.delete_one({'user': id })

		requests.post(
			os.environ.get('mailtain_api') + "/unsubscribe/0zT8VH2QI?access_token=" + os.environ.get('mailtain_access_token') + "", 
			json={
				"EMAIL":consumer["username"],
				"REQUIRE_CONFIRMATION":"no" 
			}
		)
		return render_template('admin.html')
	else:
		return 'Access denied'

# delete school
@app.route('/api/admin/delete/school/<id>', methods=['POST'])
def deleteSchool(id):
	if session['user_role'] == 'admin':
		mongo.db.school.delete_one({ 'id': id })
		mongo.db.subscription.delete_one({ 'school': id })
		# should delete teacher, director, students and classrooms,consenthash, player,emailhashref
		directors = list(mongo.db.account.find({'school':id,'role':'director'}))
		teachers = list(mongo.db.account.find({'school':id,'role':'teacher'}))
		for director in directors:
			mongo.db.emailHashRef.delete_one({ 'email': director['email'] })
			mongo.db.acceptedServiceConditions.delete_one({'user': director['id'] })
			mongo.db.account.delete_one({ 'id': director['id'] })
			requests.post(
				os.environ.get('mailtain_api') + "/unsubscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":director['email'],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
		for teacher in teachers:
			mongo.db.emailHashRef.delete_one({ 'email': teacher['email'] })
			mongo.db.acceptedServiceConditions.delete_one({'user': teacher['id'] })
			mongo.db.account.delete_one({ 'id': teacher['id'] })
			requests.post(
				os.environ.get('mailtain_api') + "/unsubscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":teacher['email'],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
		students = list(mongo.db.account.find({'school':id,'role':'student'}))
		for student in students:
			mongo.db.consentHash.delete_one({ 'student': student['id'] })
			mongo.db.player.delete_one({ 'id': student['id'] })
			mongo.db.leitnerPlayerData.delete_one({'player': student['id'] })
			mongo.db.gameState.delete_one({ 'player': student['id'] })
			mongo.db.account.delete_one({ 'id': student['id'] })
		mongo.db.classroom.delete_many({ 'school': id })
		return render_template('admin.html')
	else:
		return 'Access denied'

# delete notification
@app.route('/api/admin/delete/notification/<id>', methods=['POST'])
def deleteNotification(id):
	if session['user_role'] == 'admin':
		mongo.db.notification.delete_one({ 'id': id })
		return render_template('admin.html')
	else:
		return 'Access denied'


# SPECIAL IMPORT ROUTE
@app.route('/specialsecretimport')
def specialsecretimport():

	if session['user_role'] == 'admin':

		with open(app.root_path+'/data.txt') as json_file:
			data = json.load(json_file)

			if not data:
				return 'No data.txt file found'


			import_report = {}
			import_report['total_schools_to_create'] = len(data)
			import_report['total_schools_created'] = 0
			import_report['failed_school_creation'] = []
			import_report['total_classrooms_to_create'] = 0
			import_report['total_classrooms_created'] = 0
			import_report['total_students_to_create'] = 0
			import_report['total_students_created'] = 0
			import_report['total_teachers_to_create_invite'] = 0
			import_report['total_teachers_created_invited'] = 0
			import_report['failed_teacher_invitations'] = []
			import_report['failed_student_creation'] =[]


			for school in data:

				#create school
				uniqueSchoolNameExists = list(mongo.db.school.find({ 'name': school['school'] }))
				if len(uniqueSchoolNameExists) > 0:
					import_report['failed_school_creation'].append({
						'school':school['school'],
						'reason':'SCHOOL EXISTS'
					})
					continue
				
				schoolIdentifier = str(uuid.uuid4())
				new_school = {};
				new_school['id'] = schoolIdentifier
				new_school['name'] = school['school']
				new_school['language'] = 'Portuguese'

				mongo.db.school.insert_one(new_school)


				#create subscription

				new_subscription = {}
				new_subscription['start'] = str(datetime.datetime.now().date())
				new_subscription['end'] = '2021-07-01'
				new_subscription['id'] = str(uuid.uuid4())
				new_subscription['school'] = schoolIdentifier
				new_subscription['classroomLimit'] = '10'
				new_subscription['studentLimit'] = '500'

				mongo.db.subscription.insert_one(new_subscription)

				import_report['total_schools_created'] += 1
				
				import_report['total_classrooms_to_create'] += len(school['classrooms'])
				
				for classroom in school['classrooms']:

					#create classroom

					classroomIdentifier = str(uuid.uuid4())
					new_classroom = {}
					new_classroom['id'] = classroomIdentifier
					new_classroom['school'] = schoolIdentifier
					new_classroom['name'] = classroom['classroom']

					mongo.db.classroom.insert_one(new_classroom)

					import_report['total_classrooms_created'] += 1

					import_report['total_students_to_create'] += len(classroom['students'])

					
					for student in classroom['students']:

						#create student, player, gameState & consentHash

						uniqueStudentNameExists = list(mongo.db.account.find({'username':student, 'role':'student'}))
						if len(uniqueStudentNameExists) > 0:
							import_report['failed_student_creation'].append({
								'school':school['school'],
								'classroom':classroom['classroom'],
								'student':student,
								'reason':'USERNAME TAKEN'
							})
							continue
						else:
							studentIdentifier = str(uuid.uuid4())
							new_student = {}
							new_student['id'] = studentIdentifier
							new_student['school'] = schoolIdentifier
							new_student['classroom'] = classroomIdentifier
							new_student['name'] = 'n.n.'
							new_student['guardian'] = school['teachers'][0]
							new_student['username'] = student
							new_student['role'] = 'student'
							new_student['password'] = 'secret_hardcoded_password'

							mongo.db.account.insert_one(new_student)

							mongo.db.player.insert_one({
								'id': studentIdentifier,
								'consent': True
							})

							mongo.db.gameState.insert_one({
								'player': studentIdentifier
							})	

							hashId = str(uuid.uuid4())

							mongo.db.consentHash.insert_one({
								'hash': hashId, 
								'student': studentIdentifier
							})

							import_report['total_students_created'] += 1

				import_report['total_teachers_to_create_invite'] += len(school['teachers'])
				
				for teacher in school['teachers']:

					#create teacher
					
					uniqueTeacherEmailExists = list(mongo.db.account.find({ 'email': teacher }))
					if len(uniqueTeacherEmailExists) > 0:
						import_report['failed_teacher_invitations'].append({
							'email':teacher,
							'reason':'EMAIL EXISTS',
							'school_attempted_to_add_to':school['school']
						})
						continue

					teacherIdentifier = str(uuid.uuid4())
					new_teacher = {}
					new_teacher['id'] = teacherIdentifier
					new_teacher['email'] = teacher
					new_teacher['role'] = 'teacher'
					new_teacher['school'] = schoolIdentifier

					emailHashRef = str(uuid.uuid4())

					sendMail = sendEmailInvitation(new_teacher["email"], emailHashRef, school=new_teacher['school'])

					if sendMail:

						mongo.db.account.insert_one(new_teacher)
						mongo.db.emailHashRef.insert({'email': new_teacher["email"], 'hash': emailHashRef})

						requests.post(
							os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
							json={
								"EMAIL":new_teacher["email"],
								"REQUIRE_CONFIRMATION":"no" 
							}
						)

						import_report['total_teachers_created_invited'] += 1
					else:
						import_report['failed_teacher_invitations'].append({'teacher_email':teacher, 'reason':'INVITATION DELIVERY FAILD'})

			return json.dumps(import_report, indent=4, default=json_util.default)
	else:
		return 'Access denied'

##################################################################################################
##################################################################################################


##################################################################################################
# school API
##################################################################################################

# read operations

#read school
@app.route('/api/school/read/school', methods=['GET'])
def schoolReadDataSchool():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		school  = list(mongo.db.school.aggregate([
		    { 	'$match':
			    	{
			    		'id':session['user']['school']
			    	}
			},
			{
		    	'$lookup':
			        {
			        	'from': 'subscription',
						'localField': 'id',
						'foreignField': 'school',
						'as': 'subscription'
			        }
		    }
		]))
		return json.dumps(school[0], default=json_util.default)
	else:
		return 'Access denied'


# read staff teachers & directors in school
@app.route('/api/school/read/staff', methods=['GET'])
def schoolReadDataStaff():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		# teacher_list = list(mongo.db.account.find({'school':session['user']['school'], 'role':'teacher'}))
		staff_list  = list(mongo.db.account.aggregate([
		    { 	'$match':
			    	{
			    		'school':session['user']['school'], 
			    		'role': { '$in': ['teacher', 'director'] }
			    	}
			},
			{
		    	'$lookup':
			        {
			        	'from': "school",
			        	'localField': "school",
			        	'foreignField': "id",
			        	'as': "school-name"
			        }
		    }
		]))
		return json.dumps(staff_list, default=json_util.default)
	else:
		return 'Access denied'

# read classrooms in school
@app.route('/api/school/read/classrooms', methods=['GET'])
def schoolReadDataClassrooms():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		classroom_list = list(mongo.db.classroom.find({'school':session['user']['school'] }))
		return json.dumps(classroom_list, default=json_util.default)
	else:
		return 'Access denied'

# read students in a school
@app.route('/api/school/read/students/<classroom>', methods=['GET'])
def schoolReadDataStudents(classroom):
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		student_list  = list(mongo.db.account.find({'school':session['user']['school'],'classroom': classroom,'role':'student'}))
		
		# init leitner
		word_dict, word_pars = leitner_template.get_word_dict()
		module_dict = leitner_template.get_module_dict()
		leitner_service = leitner.Leitner(word_dict=word_dict, module_dict=module_dict, word_pars=word_pars)

		for student in student_list:
			leitner_player_data = mongo.db.leitnerPlayerData.find_one({'player': student['id']})
			student['game-state'] = mongo.db.gameState.find_one({'player': student['id']})
			student['consent'] = mongo.db.player.find_one({'id': student['id']})

			if not leitner_player_data:	
				student['progress'] = None
			else:
				if 'words' in leitner_player_data.keys() and 'modules' in leitner_player_data.keys():
					student['progress'] = leitner_service.long_progress_report(leitner_player_data['words'], leitner_player_data['modules'])
				else:
					student['progress'] = None

		return json.dumps(student_list, default=json_util.default)
		# return 'json.dumps(student_list, default=json_util.default)'
	else:
		return 'Access denied'

# read service conditions

# read user accepted service conditions
@app.route('/api/school/read/acceptedServiceConditions', methods=['POST'])
def adminReadDataAcceptedServiceConditions():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		user_id = request.json
		accepted_service_conditions = mongo.db.acceptedServiceConditions.find_one({'user':user_id})
		return json.dumps(accepted_service_conditions, default=json_util.default)
	else:
		return 'Access denied'


# create operations

# create new teacher
@app.route('/api/school/create/teacher', methods = ['POST'])
def schoolCreateDataTeacher():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		new_teacher = request.json
		if new_teacher['email']:
			checkTeacherEmail = mongo.db.account.find_one({'email':new_teacher['email'], 'role': { '$in': ['admin', 'distributor', 'teacher', 'director'] }})
			if not checkTeacherEmail:
				new_teacher['role'] = 'teacher'
				new_teacher['school'] = session['user']['school']
				new_teacher['id'] = str(uuid.uuid4())
				emailHashRef = str(uuid.uuid4())
				sendMail = sendEmailInvitation(new_teacher["email"], emailHashRef, school=new_teacher['school'])
				if sendMail:
					mongo.db.account.insert(new_teacher)
					mongo.db.emailHashRef.insert({'email': new_teacher["email"], 'hash': emailHashRef})
					# add to mailing list
					requests.post(
						os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
						json={
							"EMAIL":new_teacher["email"],
							"REQUIRE_CONFIRMATION":"no" 
						}
					)
					return json.dumps(new_teacher, default=json_util.default)
				else:
					return json.dumps({ "data": "operation failed" }), 500
			else:
				return json.dumps({ "data": "email is taken" }), 409
		else:
			return 'Missing parameters', 422
	else:
		return 'Access denied'

# create new classroom
@app.route('/api/school/create/classroom', methods = ['POST'])
def schoolCreateDataClassroom():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		new_classroom = request.json
		if new_classroom['name']:
			existingClassrooms = mongo.db.classroom.find({ 'school': session['user']['school'] })
			existingClassrooms = existingClassrooms.count()
			school_info  = list(mongo.db.school.aggregate([
			    { 	'$match':
				    	{
				    		'id':session['user']['school']
				    	}
				},
				{
			    	'$lookup':
				        {
				        	'from': 'subscription',
							'localField': 'id',
							'foreignField': 'school',
							'as': 'subscription'
				        }
			    }
			]))
			maxClassrooms = int(school_info[0]['subscription'][0]['classroomLimit'])
			if existingClassrooms < maxClassrooms:
				checkClassroomName = mongo.db.classroom.find_one({ 'name': new_classroom['name'], 'school': session['user']['school'] })
				if not checkClassroomName:
					new_classroom['school'] = session['user']['school']
					new_classroom['id'] = str(uuid.uuid4())
					mongo.db.classroom.insert(new_classroom)
					return json.dumps(new_classroom, default=json_util.default)
				else:
					return json.dumps({ "data": "classroom name is taken" }), 409
			else:
				return json.dumps({ "data": "classroom limit exceeded" }), 403
		else:
			return 'Missing parameters', 422
	else:
		return 'Access denied', 401

# create unique student username
def generateUniqueStudentUsername(name):
	uName = name + ''.join(random.sample('0123456789', 5))
	findName = mongo.db.account.find_one({'username':uName, 'role':'student'})
	if findName:
		generateUniqueStudentUsername(name)
	else:
		return uName

# create new student
@app.route('/api/school/create/student', methods = ['POST'])
def schoolCreateDataStudent():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		obj = request.json
		if all (k in obj for k in ('studentName', 'studentClassroom', 'studentUsername', 'studentPassword', 'consent', 'guardianEmail')):
			classroomStudentCount = mongo.db.account.find({'school': session['user']['school'], 'classroom': obj['studentClassroom'], 'role':'student'})
			classroomStudentCount = classroomStudentCount.count()
			school_info  = list(mongo.db.school.aggregate([
			    { 	'$match':
				    	{
				    		'id':session['user']['school']
				    	}
				},
				{
			    	'$lookup':
				        {
				        	'from': 'subscription',
							'localField': 'id',
							'foreignField': 'school',
							'as': 'subscription'
				        }
			    }
			]))
			maxStudents = int(school_info[0]['subscription'][0]['studentLimit'])
			if classroomStudentCount < maxStudents:
				studentId = str(uuid.uuid4())
				hashId = str(uuid.uuid4())
				uniqueUsername = generateUniqueStudentUsername(obj['studentUsername'])
				sendMail = sendEmailConsentRequest(obj['guardianEmail'],hashId,obj['studentName'],session['user']['school'])
				if sendMail:
					# print(session['user']['school'])
					# print(obj['studentClassroom'])
					# target_classroom = mongo.db.classroom.find_one({'school':session['user']['school'], 'name':obj['studentClassroom']})
					# print(target_classroom)
					mongo.db.account.insert_one({
						'id': studentId,
						'school': session['user']['school'],
						'classroom':obj['studentClassroom'],
						'guardian': obj['guardianEmail'],
						'name': obj['studentName'],
						'username': uniqueUsername,
						'password': obj['studentPassword'],
						'role': 'student'
						})
					mongo.db.player.insert_one({
						'id': studentId,
						'consent': obj['consent']
						})
					# create game state
					mongo.db.gameState.insert_one({
						'player': studentId
					})	
					mongo.db.consentHash.insert_one({'hash': hashId, 'student': studentId})
					# student = mongo.db.account.find_one({'id':studentId})
					# student['consent'] = [{'consent':obj['consent']}]
					student  = list(mongo.db.account.aggregate([
					    { 	'$match':
						    	{
						    		'id':studentId, 
						    		
						    	}
						},
						{
					    	'$lookup':
						        {
						        	'from': "player",
						        	'localField': "id",
						        	'foreignField': "id",
						        	'as': "consent"
						        }
					    },
					    {
					    	'$lookup':
						        {
						        	'from': "gameState",
						        	'localField': "id",
						        	'foreignField': "player",
						        	'as': "game-state"
						        }
					    }
					]))
					return json.dumps(student, default=json_util.default)
				else:
					return json.dumps({ "data": "something went wrong, please try again" }), 500
			else:
				return json.dumps({ "data": "student limit exceeded" }), 403
		else:
			return 'Missing parameters', 422	
	else:
		return 'Access denied', 401

# update operations

# update user accepted service conditions
@app.route('/api/school/update/acceptedServiceConditions', methods=['POST'])
def adminUpdateDataAcceptedServiceConditions():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		new_accepted_service_conditions = request.json
		accepted_service_conditions = mongo.db.acceptedServiceConditions.find_one({'user':session['user']['id']})
		if accepted_service_conditions:
			#update
			mongo.db.acceptedServiceConditions.find_one_and_update(
				{'user': session['user']['id']}, 
				{"$set":{
					'version':new_accepted_service_conditions['version'],
					'newsletter':new_accepted_service_conditions['newsletter']
				}}
			)
			# add new teacher/director to mailing list newsletter
			if new_accepted_service_conditions['newsletter']:
				requests.post(
					os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_newsletter_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
					json={
						"EMAIL":session['user_email'],
						"REQUIRE_CONFIRMATION":"no" 
					}
				)
		else:
			#insert new
			mongo.db.acceptedServiceConditions.insert_one({
				'user':session['user']['id'], 
				'version':new_accepted_service_conditions['version'],
				'newsletter': new_accepted_service_conditions['newsletter']
			})
			# add new teacher/director to mailing list accounts
			requests.post(
				os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_user_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":session['user_email'],
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
			# add new teacher/director to mailing list newsletter
			if new_accepted_service_conditions['newsletter']:
				requests.post(
					os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_newsletter_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
					json={
						"EMAIL":session['user_email'],
						"REQUIRE_CONFIRMATION":"no" 
					}
				)

		return 'ok'
	else:
		return 'Access denied', 401


# delete operations

# delete student
@app.route('/api/school/delete/student/<id>', methods=['POST'])
def schoolDeleteStudent(id):
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		target = mongo.db.account.find_one({'id':id})
		if target:
			if session['user']['school'] == target['school']:
				mongo.db.account.delete_one({ 'id': id })
				mongo.db.player.delete_one({ 'id': id })
				mongo.db.gameState.delete_one({ 'player': id })
				mongo.db.leitnerPlayerData.delete_one({'player': id })
				mongo.db.consentHash.delete_one({ 'student': id })
				return json.dumps({ "data": "Student deleted" }), 200
			else:
				return 'Request denied', 401
		else:
			return 'Student not found', 404
	else:
		return 'Access denied', 401 

# delete classroom and its students
@app.route('/api/school/delete/classroom', methods=['POST'])
def schoolDeleteClassroom():
	if session['user_role'] == 'director' or session['user_role'] == 'teacher':
		classroom = request.json
		if classroom['school'] and classroom['id']:
			targetClassroom = mongo.db.classroom.find_one({'id':classroom['id'], 'school':classroom['school']})
			if targetClassroom:
				if targetClassroom['school'] == session['user']['school']:
					students = list(mongo.db.account.find({'school':classroom['school'], 'classroom':classroom['id'], 'role':'student'}))
					for student in students:
						schoolDeleteStudent(student['id'])
					mongo.db.classroom.delete_one({ 'id': classroom['id'] })
					return json.dumps({ "data": "Classroom & students deleted" }), 200
				else:
					return 'Request denied', 401
			else:
				return 'Classroom not found', 404
		else:
			return 'Missing parameters', 422
	else:
		return 'Access denied', 401

##################################################################################################
##################################################################################################

##################################################################################################
# game API
##################################################################################################
# delete consumer or student account
# @app.route('/api/game/deleteAccount', methods = ['POST'])
# @jwt_required
# def gameDeleteAccount():
# 	if request.method == 'POST':
# 		# At this point call was made with a valid token. Access the identity of the current caller token
# 		player_identity = get_jwt_identity()
# 		# check if identity belongs to an actual player fo ours
# 		player = mongo.db.player.find_one({'id':player_identity})
# 		if not player:
# 				return 'invalid player', 401 

# 		account = mongo.db.account.find_one({'id': player_identity})
# 		if account['role'] == 'student':
# 			#delete student data
			
# 		if account['role'] == 'consumer':
# 			#delete consumer data
# 	else:
# 		return 'request method not allowed', 405	

@app.route('/api/game/check/token', methods=['POST'])
@jwt_required
def checkToken():
	return 'token is valid', 200


@app.route('/api/game/update/character', methods=['POST'])
@jwt_required
def gameUpdateCharacter():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 

		# get character from params
		character = request.values.get("character", None)
	    
	    #check if params are received
		if not character:
			return 'missing parameters', 422
		
		# update character
		mongo.db.gameState.find_one_and_update(
			{'player': player_identity}, 
			{"$set":{
				'character':character,
			}}
		)
		return 'character updated', 200
	else:
		return 'request method not allowed', 405

@app.route('/api/game/update/coins', methods=['POST'])
@jwt_required
def gameUpdateCoins():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 

		# get coins from params
		coins = request.values.get("coins", None)
	    
	    #check if params are received
		if not coins:
			return 'missing parameters', 422
		
		# update coins
		mongo.db.gameState.find_one_and_update(
			{'player': player_identity}, 
			{"$set":{
				'coins':coins,
			}}
		)
		return 'coins updated', 200
	else:
		return 'request method not allowed', 405

@app.route('/api/game/update/highscore', methods=['POST'])
@jwt_required
def gameUpdateHighscore():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 

		# get word,score and challenge from params
		word = request.values.get("word", None)
		score = request.values.get("score", None)
		challenge = request.values.get("challenge", None)
	    
	    #check if params are received
		if None in (word, score, challenge):
			return 'missing parameters', 422
		
		# get leitner user data
		leitner_player_data = mongo.db.leitnerPlayerData.find_one({'player': player_identity})

		# init leitner
		word_dict, word_pars = leitner_template.get_word_dict()
		module_dict = leitner_template.get_module_dict()
		leitner_service = leitner.Leitner(word_dict=word_dict, module_dict=module_dict, word_pars=word_pars)

		# check challange type
		if challenge == 'mem' or challenge == '1':
			leitner_player_data['words'] = leitner_service.update_remembered_word(word,leitner_player_data['words'], score)
		# else call update_repeated_word:
		else:
		    leitner_player_data['words'] = leitner_service.update_repeated_word(word,leitner_player_data['words'], score)

		mongo.db.leitnerPlayerData.find_one_and_update(
			{'player': player_identity}, 
			{"$set":{
				'words':leitner_player_data['words'],
			}}
		)
		mongo.db.gameState.find_one_and_update(
			{'player': player_identity}, 
			{"$set":{
				'wordHighscores':leitner_player_data['words'],
			}}
		)
		return 'highscore updated', 200
	else:
		return 'request method not allowed', 405

@app.route('/api/game/create/wordlist', methods=['POST'])
@jwt_required
def gameGenerateWordList():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 
		# this point we have received a call with a valid token that belongs to an actual player
		# Get global objects that define word and module ids:
		word_dict, word_pars = leitner_template.get_word_dict()
		module_dict = leitner_template.get_module_dict()
		# Initialise the Leitner-like system:
		leitner_service = leitner.Leitner(word_dict=word_dict, module_dict=module_dict, word_pars=word_pars)
		# check if player has defined leitner_data if not set it
		leitner_player_data = mongo.db.leitnerPlayerData.find_one({'player': player_identity})
		if not leitner_player_data:	
			leitner_player_data = {
				'player': player_identity,
				'learningsystem' : 'leitner',
				'words'   : leitner_template.get_word_json_template(),
				'modules' : leitner_template.get_module_json_template(),
				'box_probability_param' : 2.5,
				'chance_for_all_memory' : 0.4
			}
			mongo.db.leitnerPlayerData.insert_one(leitner_player_data)
			mongo.db.gameState.find_one_and_update(
				{'player': player_identity}, 
				{"$set":{
					'availableModules':leitner_player_data['modules'],
				}}
			)
		else:
			# leitner data exists update modules
			leitner_player_data['modules'] = leitner_service.update_modules(leitner_player_data['words'],leitner_player_data['modules'])
			#update modules in database for leitner data and for gameState
			mongo.db.leitnerPlayerData.find_one_and_update(
				{'player': player_identity}, 
				{"$set":{
					'modules':leitner_player_data['modules'],
				}}
			)
			mongo.db.gameState.find_one_and_update(
				{'player': player_identity}, 
				{"$set":{
					'availableModules':leitner_player_data['modules'],
				}}
			)
		word_list = leitner_service.get_words(
		 	leitner_player_data['words'],
	        module_data = leitner_player_data['modules'],
	        box_probability_param = leitner_player_data['box_probability_param'],
	        chance_for_all_memory = leitner_player_data['chance_for_all_memory'],
	        count=5, 
	        style='vertti'
		)
		# print(word_list)
		return json.dumps(word_list, default=json_util.default)
	else:
		return 'request method not allowed', 405


@app.route('/api/game/unlock/cosmetic', methods=['POST'])
@jwt_required
def gameUnlockCosmetic():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 

		# get id from params
		cosmetic_id = request.values.get("id", None)
	    
	    #check if params are received
		if not cosmetic_id:
			return 'missing parameters', 422

		game_state = mongo.db.gameState.find_one({'player':player_identity})

		if "unlocked_cosmetics" in game_state:
			if cosmetic_id in game_state['unlocked_cosmetics']:
				return 'cosmetic already unlocked', 409
			else:
				game_state['unlocked_cosmetics'].append(cosmetic_id)
				mongo.db.gameState.find_one_and_update(
					{'player': player_identity}, 
					{"$set":{
						'unlocked_cosmetics':game_state['unlocked_cosmetics'],
					}}
				)
				return 'cosmetic unlocked', 200
		else:
			# print('create and add key as array')
			cosmetic_list = [cosmetic_id]
			mongo.db.gameState.find_one_and_update(
				{'player': player_identity}, 
				{"$set":{
					'unlocked_cosmetics':cosmetic_list,
				}}
			)
			return 'cosmetic unlocked', 200
	else:
		return 'request method not allowed', 405


@app.route('/api/game/equip/cosmetic', methods=['POST'])
@jwt_required
def gameEquipCosmetic():
	if request.method == 'POST':
		# At this point call was made with a valid token. Access the identity of the current caller token
		player_identity = get_jwt_identity()
		
		# check if identity belongs to an actual player fo ours
		player = mongo.db.player.find_one({'id':player_identity})
		if not player:
			return 'invalid player', 401 

		# get id and index from params
		cosmetic_id = request.values.get('id', None)
		cosmetic_index = int(request.values.get('index', None))

	    #check if params are received
		if None in (cosmetic_id, cosmetic_index):
			return 'missing parameters', 422

		game_state = mongo.db.gameState.find_one({'player':player_identity})

		if 'equipped_cosmetics' in game_state:
			equipped_cosmetics = game_state['equipped_cosmetics']
			
			if cosmetic_index >= len(equipped_cosmetics):
				for i in range(len(equipped_cosmetics),cosmetic_index+1):		
					if i == cosmetic_index:
						equipped_cosmetics.insert(cosmetic_index, cosmetic_id)
					else:
						equipped_cosmetics.append('')
			else:
				equipped_cosmetics[cosmetic_index] = cosmetic_id
		else:
			equipped_cosmetics=[]

			for i in range(cosmetic_index+1):
				if i == cosmetic_index:
					equipped_cosmetics.insert(cosmetic_index, cosmetic_id)
				else:
					equipped_cosmetics.append('')
		
		mongo.db.gameState.find_one_and_update(
			{'player': player_identity}, 
			{"$set":{
				'equipped_cosmetics':equipped_cosmetics,
			}}
		)

		return 'cosmetic equipped', 200
	else:
		return 'request method not allowed', 405


@app.route('/api/game/login', methods=['POST'])
def playerLoginAuth():
		if request.method == 'POST':
			username = request.form['username']
			username = username.replace(" ", "")
			password = request.form['password']
			password = password.replace(" ", "")
			user  = list(mongo.db.account.aggregate([
			    { 	'$match':
				    	{
				    		'username': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'role': { '$in': ['consumer', 'student'] }
				    	}
				},
				{
			    	'$lookup':
				        {
				        	'from': "player",
				        	'localField': "id",
				        	'foreignField': "id",
				        	'as': "consent"
				        }
			    }
			]))
			if user:
				user = user[0]
				if 'school' in user.keys():
					school = mongo.db.school.find_one({'id': user['school']})
					schoolSubscription = mongo.db.subscription.find_one({'school': school['id']})
					stringDate = schoolSubscription['end']
					date_time_obj = datetime.datetime.strptime(stringDate, '%Y-%m-%d')
					if date_time_obj.date()<datetime.datetime.now().date():
						return 'subscription expired', 403
				u = {}
				u['id'] = user['id']
				u['username'] = user['username']
				u['consent'] = user['consent'][0]['consent']
				u['role'] = user['role']
				u['game_state'] = mongo.db.gameState.find_one({'player':user['id']})
				if not u['game_state']:	
					mongo.db.gameState.insert_one({'player':user['id']})
					u['game_state'] = mongo.db.gameState.find_one({'player':user['id']})
				u['words'] = leitner_template.get_word_json_template()
				# expires = datetime.timedelta(seconds=60)
				# access_token = create_access_token(identity='some user id', expires_delta=expires)
				# this token does not have an expiration date
				u['access_token'] = create_access_token(identity=user['id'])
				if 'password' in user.keys():
					if user['role'] == 'student':
						if user['password'] == password:
							return json.dumps(u, default=json_util.default)
						else:
							return 'invalid password or username', 401
					else:
						check = bcrypt.check_password_hash(user['password'], password)
						if check:  	
							return json.dumps(u, default=json_util.default)
						else:
							return 'invalid password or username', 401
				else:
					return 'this account uses auth0', 401	
			else:
				return 'invalid password or username', 401
		else:
			return 'request method not allowed', 405

# check for unique username account availability on consumers
@app.route('/api/game/checkUsername', methods = ['POST'])
def checkConsumerUsername():
	if request.method == 'POST':
		username = request.form['email']
		# user = list(mongo.db.account.find({ 'username': username, 'role':'consumer' }))
		# return json.dumps(len(user), default=json_util.default)
		count = mongo.db.account.count_documents({ 'username': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'role':'consumer' })
		if count > 0:
			return 'reserved', 423
		else:
			return 'available'	
	else:
		return 'request method not allowed', 405

# register new consumer
@app.route('/api/game/register', methods = ['POST'])
def consumerRegister():
	if request.method == 'POST':
		username = request.form['email']
		username = username.replace(" ", "")
		password = request.form['password']
		password = password.replace(" ", "")
		newsletter = request.form['newsletter']
		checkUsername = list(mongo.db.account.find({ 'username': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'role':'consumer' }))
		if checkUsername:
			return 'username taken', 403
		else:
			# create account
			uniqueID = str(uuid.uuid4())
			mongo.db.account.insert_one({
				'id': uniqueID,
				'username': username,
				'password': bcrypt.generate_password_hash(password),
				'role': 'consumer'
			})
			# create player
			mongo.db.player.insert_one({
				'id': uniqueID,
				'consent': True
			})
			# create game state
			mongo.db.gameState.insert_one({
				'player': uniqueID
			})
			# create accepted service conditions _____ seperate from CMS ?
			service_conditions = mongo.db.serviceConditions.find_one({'language':'English'})
			
			mongo.db.acceptedServiceConditions.insert_one({
				'user':uniqueID, 
				'version':service_conditions['version'],
				'newsletter': newsletter
			})
			u = {}
			u['id'] = uniqueID
			u['username'] = username
			u['consent'] = True
			u['role'] = 'consumer'
			# add new consumer to mailing list accounts
			requests.post(
				os.environ.get('mailtain_api') + "/subscribe/0zT8VH2QI?access_token=" + os.environ.get('mailtain_access_token') + "", 
				json={
					"EMAIL":username,
					"REQUIRE_CONFIRMATION":"no" 
				}
			)
			# add new consumer to mailing list newsletter
			if newsletter:
				requests.post(
					os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_newsletter_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
					json={
						"EMAIL":username,
						"REQUIRE_CONFIRMATION":"no" 
					}
				)

			return json.dumps(u, default=json_util.default)
	else:
		return 'request method not allowed', 405

# request password reset -> generates code for password reset
@app.route('/api/game/requestPasswordReset', methods = ['POST'])
def consumerRequestPasswordReset():
	if request.method == 'POST':
		username = request.form['email']
		username = username.replace(" ", "")
		user = list(mongo.db.account.find({ 'username': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'role':'consumer' }))
		if user:
			resetCode = random.sample('0123456789', 5)
			resetCode = ''.join(resetCode)
			sendMail = sendEmailConsumerPasswordResetRequest(username,resetCode)
			if sendMail:
				# delete old code if exists
				oldResetCode = list(mongo.db.passwordResetCode.find({ 'account': re.compile('^' + re.escape(username) + '$', re.IGNORECASE)}))
				if oldResetCode:
					mongo.db.passwordResetCode.delete_one({ 'account': re.compile('^' + re.escape(username) + '$', re.IGNORECASE) })
				mongo.db.passwordResetCode.insert_one({'account':username,'code':resetCode})
				return 'request processed', 200
			else:
				return 'network error, try again later', 503
		else:
			return 'invalid account username', 403
	else:
		return 'request method not allowed', 405

# reset consumer password
@app.route('/api/game/resetPassword', methods = ['POST'])
def consumerResetPassword():
	if request.method == 'POST':
		username = request.form['email']
		username = username.replace(" ", "")
		password = request.form['password']
		password = password.replace(" ", "")
		code = request.form['code']
		code = code.replace(" ", "")
		activationCode = list(mongo.db.passwordResetCode.find({ 'account': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'code':code }))
		if activationCode:
			mongo.db.account.find_one_and_update(
				{'username': re.compile('^' + re.escape(username) + '$', re.IGNORECASE)}, 
				{"$set":{
					'password':bcrypt.generate_password_hash(password),
				}}
			)
			mongo.db.passwordResetCode.delete_one({ 'account': re.compile('^' + re.escape(username) + '$', re.IGNORECASE), 'code':code })
			return 'password reset', 200
		else:
			return 'invalid account or code', 403
	else:
		return 'request method not allowed', 405


# player read accepted service conditions
@app.route('/api/game/read/acceptedServiceConditions', methods = ['POST'])
def playerReadAcceptedServiceConditions():
	if request.method == 'POST':
		user_id = request.form['user']
		accepted_service_conditions = mongo.db.acceptedServiceConditions.find_one({'user':user_id})
		if accepted_service_conditions:	
			return json.dumps(accepted_service_conditions, default=json_util.default)
		else:
			return 'invalid user', 403
	else:
		return 'request method not allowed', 405


# update player accepted service conditions THIS is only for consuers not students
@app.route('/api/game/update/acceptedServiceConditions', methods=['POST'])
def playerUpdateAcceptedServiceConditions():
	# params: user, newsletter(boolean)
	if request.method == 'POST':
		user_id = request.form['user']
		newsletter = request.form['newsletter']

		#get current system conditions
		service_conditions = mongo.db.serviceConditions.find_one({'language':'English'})
		
		#get users accepted service conditions
		accepted_service_conditions = mongo.db.acceptedServiceConditions.find_one({'user':user_id})
		
		if accepted_service_conditions:
			mongo.db.acceptedServiceConditions.find_one_and_update(
				{'user': user_id}, 
				{"$set":{
					'version':service_conditions['version'],
					'newsletter':newsletter
				}}
			)
			# add new consumer to mailing list newsletter
			if newsletter:
				user = mongo.db.account.find_one({'id':user_id})
				if user:	
					requests.post(
						os.environ.get('mailtain_api') + "/subscribe/" + os.environ.get('mailtain_newsletter_list_id') + "?access_token=" + os.environ.get('mailtain_access_token') + "", 
						json={
							"EMAIL":user['username'],
							"REQUIRE_CONFIRMATION":"no" 
						}
					)
			return 'accepted conditions updated', 200
		else:
			return 'invalid user', 403 
	else:
		return 'request method not allowed', 405

##################################################################################################
# email services
##################################################################################################

# this is sent to dtudent´s guardian email given by the teacher/director that adds the student via school cms
def sendEmailConsentRequest(receiverEmail, consentHash, studentName, school):
	sender_email = os.environ.get("EMAIL_SERVICE_ACCOUNT")
	receiver_email = receiverEmail
	password = os.environ.get("EMAIL_SERVICE_PASSWORD")

	message = MIMEMultipart("alternative")
	message["Subject"] = "TEFLON consent request"
	message["From"] = sender_email
	message["To"] = receiver_email

	# Create the plain-text and HTML version of your message
	school = mongo.db.school.find_one({'id':school})
	notification = mongo.db.notification.find_one({'type':'Consent', 'language':school['language']})
	text = notification['text'].format(studentName,school['name'],os.environ.get("PROTOCOL"),os.environ.get("DOMAIN"),consentHash,school['language'])
	html = notification['html'].format(studentName,school['name'],os.environ.get("PROTOCOL"),os.environ.get("DOMAIN"),consentHash,school['language'])
	# Turn these into plain/html MIMEText objects
	part1 = MIMEText(text, "plain")
	part2 = MIMEText(html, "html")

	# Add HTML/plain-text parts to MIMEMultipart message
	# The email client will try to render the last part first
	message.attach(part1)
	message.attach(part2)

	# Create secure connection with server and send email
	context = ssl.create_default_context()
	with smtplib.SMTP_SSL("mail.runbox.com", 465, context=context) as server:
		success = False
		for i in range(3):
			try:
				server.set_debuglevel(2)
				server.login(sender_email, password)
				server.sendmail(
					sender_email, receiver_email, message.as_string()
				)
			except:
				continue
			success = True
			break

	if success:
		return True
	else:
		return False

def sendEmailConsumerPasswordResetRequest(receiverEmail, resetCode):
	sender_email = os.environ.get("EMAIL_SERVICE_ACCOUNT")
	receiver_email = receiverEmail
	password = os.environ.get("EMAIL_SERVICE_PASSWORD")

	message = MIMEMultipart("alternative")
	message["Subject"] = "TEFLON password reset code"
	message["From"] = sender_email
	message["To"] = receiver_email

	# Create the plain-text and HTML version of your message

	text = """\
	TEFLON password reset request,
	You have requested a password reset.
	Use the following code to reset the password for your account.
	
	CODE: """+resetCode+""""""

	html = """\
	<html>
	  <body>
	    <p>TEFLON password reset request,<br>
	       You have requested a password reset.<br>
	       Use the following code to reset the password for your account.<br>
	       CODE: """+resetCode+"""
	    </p>
	  </body>
	</html>
	"""

	# Turn these into plain/html MIMEText objects
	part1 = MIMEText(text, "plain")
	part2 = MIMEText(html, "html")

	# Add HTML/plain-text parts to MIMEMultipart message
	# The email client will try to render the last part first
	message.attach(part1)
	message.attach(part2)

	# Create secure connection with server and send email
	context = ssl.create_default_context()
	with smtplib.SMTP_SSL("mail.runbox.com", 465, context=context) as server:
		success = False
		for i in range(3):
			try:
				server.set_debuglevel(2)
				server.login(sender_email, password)
				server.sendmail(
					sender_email, receiver_email, message.as_string()
				)
			except:
				continue
			success = True
			break

	if success:
		return True
	else:
		return False

def sendEmailConsumerRegistration(receiverEmail, accountPassword):
	sender_email = os.environ.get("EMAIL_SERVICE_ACCOUNT")
	receiver_email = receiverEmail
	password = os.environ.get("EMAIL_SERVICE_PASSWORD")

	message = MIMEMultipart("alternative")
	message["Subject"] = "TEFLON registration confirmation"
	message["From"] = sender_email
	message["To"] = receiver_email

	# Create the plain-text and HTML version of your message

	text = """\
	Welcome to TEFLON,
	You have been successfully registered in TEFLON.
	Use the following login credentials to access the game through your phone app:
	
	USERNAME: """+receiverEmail+"""
	PASSWORD: """+accountPassword+""""""

	html = """\
	<html>
	  <body>
	    <p>Welcome to TEFLON,<br>
	       You have been successfully registered in TEFLON.<br>
	       Use the following login credentials to access the game through your phone app:<br>
	       USERNAME: """+receiverEmail+"""
		   PASSWORD: """+accountPassword+"""
	    </p>
	  </body>
	</html>
	"""

	# Turn these into plain/html MIMEText objects
	part1 = MIMEText(text, "plain")
	part2 = MIMEText(html, "html")

	# Add HTML/plain-text parts to MIMEMultipart message
	# The email client will try to render the last part first
	message.attach(part1)
	message.attach(part2)

	# Create secure connection with server and send email
	context = ssl.create_default_context()
	with smtplib.SMTP_SSL("mail.runbox.com", 465, context=context) as server:
		success = False
		for i in range(3):
			try:
				server.set_debuglevel(2)
				server.login(sender_email, password)
				server.sendmail(
					sender_email, receiver_email, message.as_string()
				)
			except:
				continue
			success = True
			break

	if success:
		return True
	else:
		return False

def sendEmailInvitation(receiverEmail, emailHashRef, *args, **kwargs):
	sender_email = os.environ.get("EMAIL_SERVICE_ACCOUNT")
	receiver_email = receiverEmail
	password = os.environ.get("EMAIL_SERVICE_PASSWORD")

	message = MIMEMultipart("alternative")
	message["Subject"] = "TEFLON invitation"
	message["From"] = sender_email
	message["To"] = receiver_email

	# Create the plain-text and HTML version of your message
	if kwargs.get('school', None):
		school = mongo.db.school.find_one({'id':kwargs.get('school', None)})
		notification = mongo.db.notification.find_one({'type':'Invitation', 'language':school['language']})
	else:
		notification = mongo.db.notification.find_one({'type':'Invitation', 'language':'English'})

	text = notification['text'].format(prot=os.environ.get("PROTOCOL"),dom=os.environ.get("DOMAIN"),emailHashRef=emailHashRef)
	html = notification['html'].format(prot=os.environ.get("PROTOCOL"),dom=os.environ.get("DOMAIN"),emailHashRef=emailHashRef)
	# Turn these into plain/html MIMEText objects
	part1 = MIMEText(text, "plain")
	part2 = MIMEText(html, "html")
	# Add HTML/plain-text parts to MIMEMultipart message
	# The email client will try to render the last part first
	message.attach(part1)
	message.attach(part2)

	# Create secure connection with server and send email
	context = ssl.create_default_context()
	with smtplib.SMTP_SSL("mail.runbox.com", 465, context=context) as server:
		success = False
		for i in range(3):
			try:
				server.set_debuglevel(2)
				server.login(sender_email, password)
				server.sendmail(
					sender_email, receiver_email, message.as_string()
				)
			except:
				continue
			success = True
			break

	if success:
		return True
	else:
		return False

##################################################################################################
##################################################################################################


if __name__ == "__main__":
	app.run(debug=False, host='0.0.0.0')
