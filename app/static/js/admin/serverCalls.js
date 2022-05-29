function getSessionInfo(){
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/userInfo",
	  success: function (response) {  
			session = response; 
			message("Welcome "+session.user_email,3000);
			message("Role: "+session.user_role,3000);
	  },
	  dataType: "json"
	}); 							
}

function getAdmins(){
	message("Loading admins", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/admins",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			admins = response;
	  			renderAdmins(admins);
				message("Admins loaded", 3000);
			}else{
	  			message("No admins exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getDistributors(){
	message("Loading distributors", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/distributors",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			distributors = response;
	  			renderDistributors(distributors);
				message("Distributors loaded", 3000);
			}else{
	  			message("No distributors exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getSchools(){
	message("Loading schools", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/schools",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			schools = response;
	  			renderSchools(schools);
				message("Schools loaded", 3000);
			}else{
	  			message("No schools exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getNotifications(){
	message("Loading notifications", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/notifications",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			notifications = response;
	  			renderNotifications(notifications);
				message("Notifications loaded", 3000);
			}else{
	  			message("No notifications exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getDirectors(){
	message("Loading directors", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/directors",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			directors = response;
	  			renderDirectors(directors);
				message("Directors loaded", 3000);
			}else{
	  			message("No directors exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getTeachers(){
	message("Loading teachers", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/teachers",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			teachers = response;
	  			renderTeachers(teachers);
				message("Teachers loaded", 3000);
			}else{
	  			message("No teachers exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function getConsumers(){
	message("Loading consumers", 3000);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/read/consumers",
	  success: function (response) {  
	  		if(response.length){
	  			console.log(response)
	  			consumers = response;
	  			renderConsumers(consumers);
				message("Consumers loaded", 3000);
			}else{
	  			message("No consumers exist", 3000);
	  		}
	  },
	  dataType: "json"
	}); 	
}

function checkEmailAvailability(email){
	console.log(email);
	$.ajax({
	  type: "POST",
	  url: "/checkEmailAvailability/"+email,
	  success: function (response) { 
	  console.log(response); 
		if(response){
			console.log('invalid');
			$("#newAdminEmailInput").css("border", "1px solid red");
			emailValid = false;
		}else{
			if(validateEmail(email)){
				$("#newAdminEmailInput").css("border", "1px solid green");
				emailValid = true;
			}else{
				$("#newAdminEmailInput").css("border", "1px solid red");
				emailValid = false;
			}
			
			
		}
		validateNewAdminFrom();
	  },
	  dataType: "json"
	});							
}

function checkSchoolAvailabilityNewSchool(school){
	console.log(school);
	$.ajax({
	  type: "POST",
	  url: "/checkSchoolAvailability/"+school,
	  success: function (response) { 
	  console.log(response); 
		if(response){
			console.log('invalid');
			schoolValid = false;
			$("#newSchoolInput").css("border", "1px solid red");
		}else{
			schoolValid = true;
			$("#newSchoolInput").css("border", "1px solid green");
		}
		validateNewSchoolForm();
	  },
	  dataType: "json"
	});							
}

function checkSchoolAvailabilityEditSchool(school){
	console.log(school);
	$.ajax({
	  type: "POST",
	  url: "/checkSchoolAvailability/"+school,
	  success: function (response) { 
	  console.log(response); 
		if(response){
			console.log('invalid');
			schoolValid = false;
			$("#editSchoolNameInput").css("border", "1px solid red");
		}else{
			schoolValid = true;
			$("#editSchoolNameInput").css("border", "1px solid green");
		}
		validateEditSchoolForm();
	  },
	  dataType: "json"
	});							
}

function checkDirectorAvailability(director){
	console.log(director);
	$.ajax({
	  type: "POST",
	  url: "/checkEmailAvailability/"+director,
	  success: function (response) { 
		if(response){
			$("#newDirectorEmailInput").css("border", "1px solid red");
			emailValid = false;
		}else{
			if(validateEmail(director)){
				$("#newDirectorEmailInput").css("border", "1px solid green");
				emailValid = true;
			}else{
				$("#newDirectorEmailInput").css("border", "1px solid red");
				emailValid = false;
			}
		}
		validateNewDirectorFrom();
	  },
	  dataType: "json"
	});							
}

function checkTeacherAvailability(teacher){
	$.ajax({
	  type: "POST",
	  url: "/checkEmailAvailability/"+teacher,
	  success: function (response) { 
		if(response){
			$("#newTeacherEmailInput").css("border", "1px solid red");
			emailValid = false;
		}else{
			if(validateEmail(teacher)){
				$("#newTeacherEmailInput").css("border", "1px solid green");
				emailValid = true;
			}else{
				$("#newTeacherEmailInput").css("border", "1px solid red");
				emailValid = false;
			}
		}
		validateNewTeacherFrom();
	  },
	  dataType: "json"
	});							
}

function checkDistributorAvailability(email){
	console.log(email);
	$.ajax({
	  type: "POST",
	  url: "/checkEmailAvailability/"+email,
	  success: function (response) { 
	  console.log(response); 
	  // response == 0 || 1
		if(response){
			console.log('invalid');
			$("#newDistributorEmailInput").css("border", "1px solid red");
			emailValid = false;
		}else{
			if(validateEmail(email)){
				$("#newDistributorEmailInput").css("border", "1px solid green");
				emailValid = true;
			}else{
				$("#newDistributorEmailInput").css("border", "1px solid red");
				emailValid = false;
			}		
		}
		validateNewDistributorFrom();
	  },
	  dataType: "json"
	});							
}

function checkTestStudentUsernameAvailability(name,numberAccounts){
	if($('#newTestStudentPanel').is(':visible')){
		$.ajax({
		  type: "POST",
		  url: "/api/admin/checkTestStudentUsernameAvailability/"+name+"/"+numberAccounts,
		  dataType: "json"
		})
		.done(function (response) { 
			$("#newTestStudentNameInput").prop( "disabled", false );
			// returns true if all names available, else false
			if(!response){
				$("#newTestStudentNameInput").data('data-valid', false);
				updateFormElementValidityStyle('newTestStudentNameInput', false, 'Usernames taken');
			}else{
				// For leading zeros on names
		        // var minPrefix = (function() {
		        //   var prefix = '';
		        //   for(var i=0; i<$("#newTestStudentNumberAccountsInput").val().length; i++){
		        //     if(i<$("#newTestStudentNumberAccountsInput").val().length-1){
		        //       console.log(i)
		        //       prefix = prefix+'0';
		        //     }else{
		        //       prefix = prefix+'1';
		        //       return prefix;
		        //     }
		        //   }   
		        // })();
		        var minPrefix = '1';
		        var maxPrefix = $('#newTestStudentNumberAccountsInput').val();
		        $("#newTestStudentNameInput").data('data-valid', true,);
		        updateFormElementValidityStyle('newTestStudentNameInput', true, 'Usernames will be: '+name+minPrefix+' - '+name+maxPrefix); 
			}
			validateNewTestStudentsForm();
		})
		.fail(function (response) { 
			$("#newTestStudentNameInput").prop( "disabled", true );
			$("#newTestStudentNameInput").data('data-valid', false);
			updateFormElementValidityStyle('newTestStudentNameInput', 'unknown', 'Connection issues, reconnecting...');
			validateNewTestStudentsForm();
			setTimeout(function(){ 
				checkTestStudentUsernameAvailability(name,numberAccounts);
	      	}, 1000)
		});	
	}						
}

function createNewTestStudentAccounts(){
	newTestStudentSubmitMsg.innerHTML = '';
	$("#newTestStudentCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newTestStudentsRef = {};
	newTestStudentsRef.school = $('#newTestStudentSchoolInput').val();
	newTestStudentsRef.guardian = $('#newTestStudentGuardianInput').val();
	newTestStudentsRef.accounts = $('#newTestStudentNumberAccountsInput').val();
	newTestStudentsRef.classrooms = $('#newTestStudentNumberClassroomsInput').val();
	newTestStudentsRef.name = $('#newTestStudentNameInput').val();
	newTestStudentsRef.password = $("input[type='radio'][name='newTestStudentRandomPassword']:checked").val() == 'true' ? true : false;
	newTestStudentsRef.username = $('#newTestStudentNameInput').val().replace(/\s/g, '');

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/testStudentAccounts",
	  data: JSON.stringify(newTestStudentsRef),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	$("#newTestStudentCreateBtn").prop("disabled",false);
	    	$('#newTestStudentPanel').modal('toggle');
	    	loader.style.display = 'none';
	    }
	  }  
	})
	.fail(function(response) {
	    loader.style.display = 'none';
    	$("#newTestStudentCreateBtn").prop("disabled",false);
    	newTestStudentSubmitMsg.innerHTML = 'something went wrong, please try again';
	});
}

function createNewAdmin(){
	$("#newAdminCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newAdmin = {};
	newAdmin.id = generateUUID();
	newAdmin.email = $("#newAdminEmailInput").val();
	newAdmin.role = "admin";

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/admin",
	  data: JSON.stringify(newAdmin),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
    		$('#newAdminPanel').modal('toggle');
    		admins.push(response);
	    	if(admins.length<2){
	    		renderAdmins(admins)
	    	}
	    	$("#newAdminCreateBtn").prop("disabled",false);
	    },
	    500: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
	    	$("#newAdminCreateBtn").prop("disabled",false);
	    	newAdminSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    }
	  }  
	});
}

function createNewDistributor(){
	$("#newDistributorCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newDistributor = {};
	newDistributor.id = generateUUID();
	newDistributor.email = $("#newDistributorEmailInput").val();
	newDistributor.role = "distributor";

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/admin",
	  data: JSON.stringify(newDistributor),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
    		$('#newDistributorPanel').modal('toggle');
    		distributors.push(response);
	    	if(distributors.length<2){
	    		renderDistributors(distributors)
	    	}
	    	$("#newAdminCreateBtn").prop("disabled",false);
	    },
	    500: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
	    	$("#newDistributorCreateBtn").prop("disabled",false);
	    	newDistributorSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    }
	  }  
	});
}

function createNewSchool(){
	$("#newSchoolCreateBtn").prop("disabled",true);
	var newSchool = {};
	newSchool.id = generateUUID();
	newSchool.name = $("#newSchoolInput").val();
	newSchool.language = $("#newSchoolLanguageInput").val();
	newSchool.subsriptionEndDate = $("#newSchoolInputSubscriptionEndDate").val();
	newSchool.classroomLimit = $("#newSchoolInputClassroomLimit").val();
	newSchool.studentLimit = $("#newSchoolInputStudentLimit").val();

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/school",
	  data: JSON.stringify(newSchool),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
    		$('#newSchoolPanel').modal('toggle');
    		response['subscription_start'] = response['subscription'][0]['start'];
			response['subscription_end'] = response['subscription'][0]['end'];
    		schools.push(response);
	    	if(schools.length<2){
	    		renderSchools(schools)
	    	}
	    	$("#newSchoolCreateBtn").prop("disabled",false);
	    }
	  }  
	});
}

function updateSchool(){
	$("#editSchoolCreateBtn").prop("disabled",true);
	
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	
	var updatedSchool = {};
	updatedSchool.id = entryToEdit.id;
	updatedSchool.name = $("#editSchoolNameInput").val();
	updatedSchool.language = $("#editSchoolLanguageInput").val();
	updatedSchool.start = $("#editSchoolInputSubscriptionStartDate").val();
	updatedSchool.end = $("#editSchoolInputSubscriptionEndDate").val();
	updatedSchool.classroomLimit = $("#editSchoolClassroomLimit").val();
	updatedSchool.studentLimit = $("#editSchoolStudentLimit").val();
	console.log(updatedSchool);
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/update/school",
	  data: JSON.stringify(updatedSchool),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	loader.style.display = 'none';
	    	entryToEdit = {};
	    	$("#editSchoolCreateBtn").prop("disabled",false);
	    	$('#editSchoolPanel').modal('toggle');
	    	getSchools();
	    }
	  }  
	});
}

function createNewNotification(){
	$("#newNotificationCreateBtn").prop("disabled",true);
	var newNotification = {};
	newNotification.id = generateUUID();
	newNotification.type = $("#newNotificationInput").val();
	newNotification.language = $("#newNotificationLanguageInput").val();
	newNotification.text = $("#newNotificationTextContentInput").val();
	newNotification.html = $("#newNotificationHtmlContentInput").val();

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/notification",
	  data: JSON.stringify(newNotification),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
    		$('#newNotificationPanel').modal('toggle');
    		notifications.push(response);
	    	if(notifications.length<2){
	    		renderNotifications(notifications)
	    	}
	    	$("#newNotificationCreateBtn").prop("disabled",false);
	    }
	  }  
	});
}

function createNewDirector(){
	$("#newDirectorCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newDirector = {};
	newDirector.id = generateUUID();
	newDirector.email = $("#newDirectorEmailInput").val();
	newDirector.school = $("#newDirectorSchoolInput").val();
	console.log(newDirector);

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/director",
	  data: JSON.stringify(newDirector),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
    		$('#newDirectorPanel').modal('toggle');
    		directors.push(response);
	    	if(directors.length<2){
	    		renderDirectors(directors)
	    	}
	    	$("#newDirectorCreateBtn").prop("disabled",false);
	    },
	    500: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
	    	$("#newDirectorCreateBtn").prop("disabled",false);
	    	newDirectorSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    }
	  }  
	});
}

function createNewTeacher(){
	$("#newTeacherCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newTeacher = {};
	newTeacher.id = generateUUID();
	newTeacher.email = $("#newTeacherEmailInput").val();
	newTeacher.school = $("#newTeacherSchoolInput").val();

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/teacher",
	  data: JSON.stringify(newTeacher),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
    		$('#newTeacherPanel').modal('toggle');
    		teachers.push(response);
	    	if(teachers.length<2){
	    		renderTeachers(teachers)
	    	}
	    	$("#newTeacherCreateBtn").prop("disabled",false);
	    },
	    500: function(response) {
	    	console.log(response);
	    	loader.style.display = 'none';
	    	$("#newTeacherCreateBtn").prop("disabled",false);
	    	newTeacherSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    }
	  }  
	});
}

function createMultipleSchoolsAndTeachers(){
	$("#newSchoolTeacherMultiCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var obj = {};
	obj.dateString = $("#newSchoolMultiInputSubscriptionEndDate").val() ;
	obj.jsonArr = multiSchoolsAndTeachers;
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/multipleSchoolsTeachers",
	  data: JSON.stringify(obj),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	loader.style.display = 'none';
	    	$("#newSchoolTeacherMultiCreateBtn").prop("disabled",false);
	    	$('#newSchoolTeacherMultiPanel').modal('toggle');
	    	getSchools();
  			getTeachers();
	    }
	  }  
	});
}

function createNewConsumer(){
	$("#newConsumerCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/create/consumers",
	  data: JSON.stringify(consumersJSON),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	loader.style.display = 'none';
	    	$("#newConsumerCreateBtn").prop("disabled",false);
	    	$('#newConsumerPanel').modal('toggle');
	    	getConsumers();
	    }
	  }  
	});
}

function deleteAdmin(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/user/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteAdminPanel').modal('toggle');
	    	admins = _.reject(admins, {
				id: entryToDelete
			})
			renderAdmins(admins);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteDistributor(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/user/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteDistributorPanel').modal('toggle');
	    	distributors = _.reject(distributors, {
				id: entryToDelete
			})
			renderDistributors(distributors);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteDirector(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/user/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteDirectorPanel').modal('toggle');
	    	directors = _.reject(directors, {
				id: entryToDelete
			})
			renderDirectors(directors);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteTeacher(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/user/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteTeacherPanel').modal('toggle');
	    	teachers = _.reject(teachers, {
				id: entryToDelete
			})
			renderTeachers(teachers);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteConsumer(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/consumer/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteConsumerPanel').modal('toggle');
	    	consumers = _.reject(consumers, {
				id: entryToDelete
			})
			renderConsumers(consumers);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteSchool(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/school/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteSchoolPanel').modal('toggle');
	    	schools = _.reject(schools, {
				id: entryToDelete
			})
			renderSchools(schools);
			teachers = _.reject(teachers, {
				school: entryToDelete
			})
			renderTeachers(teachers);
			directors = _.reject(directors, {
				school: entryToDelete
			})
			renderDirectors(directors);
			entryToDelete= "";
	    }
	  }  
	});
}

function deleteNotification(){
	$.ajax({
	  type: "POST",
	  url: "/api/admin/delete/notification/"+entryToDelete,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	//find by id with underscore in admins [] and remove
	    	$('#deleteNotificationPanel').modal('toggle');
	    	notifications = _.reject(notifications, {
				id: entryToDelete
			})
			renderNotifications(notifications);
			entryToDelete= "";
	    }
	  }  
	});
}

function updateServiceConditions(){
	var newServiceConditions = {};
	newServiceConditions.version = $("#serviceConditionsVersion").val();
	newServiceConditions.termsOfService = $("#termsOfServiceInput").val();
	newServiceConditions.privacyPolicy = $("#privacyPolicyInput").val();
	newServiceConditions.newsletterConsent = $("#newsletterConsentInput").val();
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/admin/update/serviceConditions",
	  data: JSON.stringify(newServiceConditions),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	$('#serviceConditionsPanel').modal('toggle');
	    }
	  }  
	});
}

function populateServiceConditionsForm(){
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/readServiceConditions",
	  success: function (response) {  
	  	$("#serviceConditionsVersion").val(response.version);
		$("#termsOfServiceInput").val(response['termsOfService']);
		$("#privacyPolicyInput").val(response['privacyPolicy']);
		$("#newsletterConsentInput").val(response['newsletterConsent']);
	  	console.log(response);
	  },
	  dataType: "json"
	}); 
}
