function getSessionInfo(){
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/userInfo",
	  success: function (response) {  
			session = response; 
			getServiceConditionsUserStatus();
	  },
	  dataType: "json"
	}); 							
}

function getSchool(){
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/read/school",
	  success: function (response) {  
			school = response;
			renderSchoolName(school.name);
	  },
	  dataType: "json"
	}); 
}

function getStaff(){
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	$("#dropDownMenuLinkWrapTeacher").addClass('disabledMenuBtn');
	$("#dropDownMenuLinkWrapClassroom").addClass('disabledMenuBtn');
	openStaff();	
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/read/staff",
	  success: function (response) {  
  			loader.style.display = 'none';
  			$("#dropDownMenuLinkWrapTeacher").removeClass('disabledMenuBtn');
			$("#dropDownMenuLinkWrapClassroom").removeClass('disabledMenuBtn');
  			staff = _.groupBy(response, 'role');;
  			renderStaff();
	  },
	  dataType: "json"
	}); 	
}

function getClassrooms(){
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	$("#dropDownMenuLinkWrapTeacher").addClass('disabledMenuBtn');
	$("#dropDownMenuLinkWrapClassroom").addClass('disabledMenuBtn');
	openClassrooms();	
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/read/classrooms",
	  success: function (response) {  
  			loader.style.display = 'none';
  			$("#dropDownMenuLinkWrapTeacher").removeClass('disabledMenuBtn');
			$("#dropDownMenuLinkWrapClassroom").removeClass('disabledMenuBtn');
  			classrooms = response;
  			renderClassrooms();
	  },
	  dataType: "json"
	}); 	
}

function getStudents(classroomId,classroomName){
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	$("#dropDownMenuLinkWrapTeacher").addClass('disabledMenuBtn');
	$("#dropDownMenuLinkWrapClassroom").addClass('disabledMenuBtn');
	openClassroom(classroomId,classroomName);
	$.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/read/students/"+classroomId,
	  success: function (response) {  
	  			loader.style.display = 'none';
	  			$("#dropDownMenuLinkWrapTeacher").removeClass('disabledMenuBtn');
				$("#dropDownMenuLinkWrapClassroom").removeClass('disabledMenuBtn');
	  			students = response;
	  			renderStudents();		
	  },
	  dataType: "json"
	}); 	
}

function checkTeacherEmailAvailability(teacher){
	if($('#newTeacherPanel').is(':visible')){
		$.ajax({
		  type: "POST",
		  url: "/checkEmailAvailability/"+teacher,
		  dataType: "json"
		})
		.done(function (response) { 
			$("#newTeacherEmailInput").prop( "disabled", false );
			$('#newTeacherEmailInput').focus();
			if(response){
				$('#newTeacherEmailInput').data('data-valid', false);
				updateFormElementValidityStyle('newTeacherEmailInput', false, 'Email is taken');
			}else{
				$('#newTeacherEmailInput').data('data-valid', true);
				updateFormElementValidityStyle('newTeacherEmailInput', true);
			}
			validateNewTeacherForm();
		})
		.fail(function (response) { 
			$("#newTeacherEmailInput").prop( "disabled", true );
			$('#newTeacherEmailInput').data('data-valid', false);
			updateFormElementValidityStyle('newTeacherEmailInput', 'unknown', 'Connection issues, reconnecting...');
			validateNewTeacherForm();
			setTimeout(function(){ 
				checkTeacherEmailAvailability(teacher);
	      	}, 1000)
		});	
	}						
}

function checkClassroomNameAvailability(classroom){
	if($('#newClassroomPanel').is(':visible')){
		$.ajax({
		  type: "POST",
		  url: "/checkClassroomAvailability/"+classroom+"/"+session.user.school,
		  dataType: "json"
		})
		.done(function (response) { 
			$("#newClassroomNameInput").prop( "disabled", false );
			$('#newClassroomNameInput').focus();
			if(response){
				$('#newClassroomNameInput').data('data-valid', false);
				updateFormElementValidityStyle('newClassroomNameInput', false, 'Classroom name is taken');
			}else{
				$('#newClassroomNameInput').data('data-valid', true);
				updateFormElementValidityStyle('newClassroomNameInput', true);
			}
			validateNewClassroomForm();
		})
		.fail(function (response) { 
			$("#newClassroomNameInput").prop( "disabled", true );
			$('#newClassroomNameInput').data('data-valid', false);
			updateFormElementValidityStyle('newClassroomNameInput', 'unknown', 'Connection issues, reconnecting...');
			validateNewClassroomForm();
			setTimeout(function(){ 
				checkClassroomNameAvailability(classroom);
	      	}, 1000)
		});	
	}						
}

function createNewTeacher(){
	newTeacherSubmitMsg.innerHTML = '';
	$("#newTeacherCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newTeacher = {};
	newTeacher.email = $("#newTeacherEmailInput").val();

	// avoid modal close while processing
	$('#newTeacherPanel').data('bs.modal').options.backdrop = 'static';
	$('#newTeacherPanel').data('bs.modal').options.keyboard = false;
	$('#newTeacherPanelCloseBtn').css("display", "none");

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/create/teacher",
	  data: JSON.stringify(newTeacher),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	// enable modal close after processing
			$('#newTeacherPanel').data('bs.modal').options.backdrop = true;
			$('#newTeacherPanel').data('bs.modal').options.keyboard = true;
			$('#newTeacherPanelCloseBtn').css("display", "block");

	    	console.log(response);
	    	loader.style.display = 'none';
    		newTeacherSubmitMsg.innerHTML = '"teacher created successfully"';
    		$("#newTeacherEmailInput").val("");
    		updateFormElementValidityStyle('newTeacherEmailInput', 'empty');
    		$("#newTeacherCreateBtn").css("display", "none");
	    	$("#newTeacherCreateBtn").prop("disabled",false);
	    	$('#newTeacherEmailInput').focus();
	    	if('teacher' in staff){
	    		staff.teacher.push(response);
	    	}else{
	    		staff['teacher'] = [response];
	    	}
	    	renderStaff();
	    }
	  }  
	})
	.fail(function(response) {
			// enable modal close after processing
			$('#newTeacherPanel').data('bs.modal').options.backdrop = true;
			$('#newTeacherPanel').data('bs.modal').options.keyboard = true;
			$('#newTeacherPanelCloseBtn').css("display", "block");

	    	loader.style.display = 'none';
	    	if(response.status == 409){
	    		$("#newTeacherCreateBtn").prop("disabled",false);
				updateFormElementValidityStyle('newTeacherEmailInput', false, 'Email is taken');
				validateNewTeacherForm();
	    	}else{
	    		$("#newTeacherCreateBtn").prop("disabled",false);
	    		newTeacherSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    	}
	});
}

function createNewClassroom(){
	newClassroomSubmitMsg.innerHTML = '';
	$("#newClassroomCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var newClassroom = {};
	newClassroom.name = $("#newClassroomNameInput").val();
	console.log('Creating classroom');

	// disable modal close after processing
	$('#newClassroomPanel').data('bs.modal').options.backdrop = 'static';
	$('#newClassroomPanel').data('bs.modal').options.keyboard = false;
	$('#newClassroomPanelCloseBtn').css("display", "none");
	
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/create/classroom",
	  data: JSON.stringify(newClassroom),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
			// enable modal close before processing
			$('#newClassroomPanel').data('bs.modal').options.backdrop = true;
			$('#newClassroomPanel').data('bs.modal').options.keyboard = true;
			$('#newClassroomPanelCloseBtn').css("display", "block");

	    	loader.style.display = 'none';
	    	newClassroomSubmitMsg.innerHTML = '"classroom created successfully"';
    		$("#newClassroomNameInput").val("");
    		updateFormElementValidityStyle('newClassroomNameInput', 'empty');
    		$("#newClassroomCreateBtn").css("display", "none");
	    	$("#newClassroomCreateBtn").prop("disabled",false);
	    	$('#newClassroomNameInput').focus();
	    	console.log('adding');
	    	classrooms.push(response);
	    	var list = document.getElementById('classroomList');
	    	list.insertBefore(renderClassroom(response), list.firstChild);

	    	var classroomLimitsIndicator = document.getElementById('classroomLimitIndicator');
			classroomLimitsIndicator.innerHTML = classrooms.length+'/'+school.subscription[0].classroomLimit;
	    }
	  }  
	})
	.fail(function(response) {
			// enable modal close after processing
			$('#newClassroomPanel').data('bs.modal').options.backdrop = true;
			$('#newClassroomPanel').data('bs.modal').options.keyboard = true;
			$('#newClassroomPanelCloseBtn').css("display", "block");

	    	loader.style.display = 'none';
	    	if(response.status == 409){
	    		$("#newClassroomCreateBtn").prop("disabled",false);
				updateFormElementValidityStyle('newClassroomNameInput', false, 'classroom name is taken');
				validateNewClassroomForm();
	    	}else if(response.status == 403){
	    		$("#newClassroomPanelTitle").css("display", "none");
	    		var classroomForm = document.getElementById("newClassroomPanel").getElementsByClassName("modal-body")[0];
				classroomForm.style.display = 'none';
				newClassroomSubmitMsg.innerHTML = '"you have exceeded the limit of classrooms per school"';

	    	}else{
	    		$("#newClassroomCreateBtn").prop("disabled",false);
	    		newClassroomSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    	}
	});
}

function createNewStudent(){
	newStudentSubmitMsg.innerHTML = "";
	$("#newStudentCreateBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	var obj ={}
	obj.studentName = $("#newStudentNameInput").val();
	obj.studentClassroom = currentClassroomId;
	obj.studentUsername = $("#newStudentNameInput").val().replace(/\s/g, '');
	obj.studentPassword = random5digits().toString();
	obj.consent = $("input[type='radio'][name='newStudentGuardianConsentOpt']:checked").val() == 'true' ? true : false;
	obj.guardianEmail = $("#newStudentGuardianInput").val();
	console.log(obj);

	// disable modal close before processing
	$('#newStudentPanel').data('bs.modal').options.backdrop = 'static';
	$('#newStudentPanel').data('bs.modal').options.keyboard = false;
	$('#newStudentPanelCloseBtn').css("display", "none");

	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/api/school/create/student",
	  data: JSON.stringify(obj),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	// disable modal close before processing
			$('#newStudentPanel').data('bs.modal').options.backdrop = true;
			$('#newStudentPanel').data('bs.modal').options.keyboard = true;
			$('#newStudentPanelCloseBtn').css("display", "block");
	    	// console.log(response);
	    	loader.style.display = 'none';
	    	newStudentSubmitMsg.innerHTML = '"student created successfully"';
	    	$("#newStudentNameInput").val("");
		    $("#newStudentGuardianInput").val("");
		    $('#newStudentNameInput').data('data-valid', false);
    		$('#newStudentGuardianInput').data('data-valid', false);
		    updateFormElementValidityStyle('newStudentNameInput', 'empty');
		    updateFormElementValidityStyle('newStudentGuardianInput', 'empty');
    		$("#newStudentCreateBtn").css("display", "none");
	    	$("#newStudentCreateBtn").prop("disabled",false);
	    	$('#newStudentNameInput').focus();
	    	response[0]['consent'] = response[0]['consent'][0];
	    	students.push(response[0]);
	    	var list = document.getElementById('studentList');
	    	list.insertBefore(renderStudent(response[0]), list.firstChild);

			var studentLimitIndicator = document.getElementById('studentLimitIndicator');
			studentLimitIndicator.innerHTML = students.length+'/'+school.subscription[0].studentLimit;
	    }
	  }  
	})
	.fail(function(response) {
			// disable modal close before processing
			$('#newStudentPanel').data('bs.modal').options.backdrop = true;
			$('#newStudentPanel').data('bs.modal').options.keyboard = true;
			$('#newStudentPanelCloseBtn').css("display", "block");
	    	loader.style.display = 'none';
	    	if(response.status == 403){
		    	console.log(response);
		    	loader.style.display = 'none';
		    	$("#newStudentCreateBtn").prop("disabled",false);
		    	$("#newStudentPanelTitle").css("display", "none");
		    	var studentForm = document.getElementById("newStudentPanel").getElementsByClassName("modal-body")[0];
				studentForm.style.display = 'none';
		    	newStudentSubmitMsg.innerHTML = '"student limit exceeded"';		
	    	}else{
	    		$("#newStudentCreateBtn").prop("disabled",false);
	    		newStudentSubmitMsg.innerHTML = '"something went wrong, please try again"';
	    	}
	});
}

function deleteStudent(){
	deleteStudentSubmitMessage.innerHTML = "";
	$("#deleteStudentBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';
	
	$.ajax({
	  type: "POST",
	  url: "/api/school/delete/student/"+entryToDelete.id,
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	$("#deleteStudentBtn").prop("disabled",false);
			loader.style.display = 'none';
	    	//find by id with underscore in students [] and remove
	    	$('#deleteStudentPanel').modal('toggle');
	    	students = _.reject(students, {
				id: entryToDelete.id
			})
			var elementToDelete = document.getElementById(entryToDelete.id);
			elementToDelete.parentNode.removeChild(elementToDelete);
			entryToDelete = {};

			var studentLimitIndicator = document.getElementById('studentLimitIndicator');
			studentLimitIndicator.innerHTML = students.length+'/'+school.subscription[0].studentLimit;
	    }
	  }  
	})
	.fail(function(response) {
		console.log('triggered');
    	loader.style.display = 'none';
    	$("#deleteStudentBtn").prop("disabled",false);
    	deleteStudentSubmitMessage.innerHTML = '"something went wrong, please try again"';   	
	});
}

function deleteClassroom(){
	deleteClassroomSubmitMessage.innerHTML = "";
	$("#deleteClassroomBtn").prop("disabled",true);
	var loader = document.getElementById("footerLoader");
	loader.style.display = 'block';

	$.ajax({
	  type: "POST",
	  url: "/api/school/delete/classroom",
	  dataType: "json",
	  contentType: "application/json; charset=utf-8",
	  data: JSON.stringify(entryToDelete),
	  statusCode: {
	    200: function(response) {
	    	loader.style.display = 'none';
	    	$("#deleteClassroomBtn").prop("disabled",false);
	    	$('#deleteClassroomPanel').modal('toggle');
	    	classrooms = _.reject(classrooms, {
				id: entryToDelete.id
			})
			students = _.reject(students, {
				classroom: entryToDelete.id
			})
			var elementToDelete = document.getElementById(entryToDelete.id);
			elementToDelete.parentNode.removeChild(elementToDelete);
			entryToDelete = {};

			var classroomLimitsIndicator = document.getElementById('classroomLimitIndicator');
			classroomLimitsIndicator.innerHTML = classrooms.length+'/'+school.subscription[0].classroomLimit;
	    }
	  }  
	})
	.fail(function(response) {
    	loader.style.display = 'none';
    	$("#deleteClassroomBtn").prop("disabled",false);
    	deleteClassroomSubmitMessage.innerHTML = '"something went wrong, please try again"';   	
	});
}

function getServiceConditionsUserStatus(){
	$.when(getServiceConditions(), getAcceptedServiceConditions()).done(function(r1, r2){
		// console.log(r1);
		// console.log(r2);
		serviceConditions = r1[0];
	   	if((r2[0] == null) || (parseInt(r2[0].version) < parseInt(r1[0].version))){
	   		
    		//render whole form to accept
    		$('#serviceConditionsPanel').modal({
			    backdrop: 'static',
			    keyboard: false
			});
			$("#acceptServiceConditionsBtn").css("display", "none");
			$("#termsOfService").val(r1[0]['termsOfService']);
			$("#privacyPolicy").val(r1[0]['privacyPolicy']);
			$("#newsletterCheckBoxLabel").text(r1[0]['newsletterConsent']);
			
    	}
	});
}

function getServiceConditions(){
	return $.ajax({
	  type: "GET",
	  contentType: "application/json; charset=utf-8",
	  url: "/readServiceConditions",
	  dataType: "json"
	}); 
}

function getAcceptedServiceConditions(){
	return $.ajax({
	  type: "POST",
	  url: "/api/school/read/acceptedServiceConditions",
	  dataType: "json",
	  contentType: "application/json; charset=utf-8",
	  data: JSON.stringify(session.user.id) 
	});
	
}

function acceptServiceConditions(){
	var newAcceptedServiceConditions = {};
	newAcceptedServiceConditions.newsletter = $("#newsletterCheckBox").prop('checked');
	newAcceptedServiceConditions.version = serviceConditions.version;
	console.log(newAcceptedServiceConditions);
	$.ajax({
	  type: "POST",
	  url: "/api/school/update/acceptedServiceConditions",
	  dataType: "json",
	  contentType: "application/json; charset=utf-8",
	  data: JSON.stringify(newAcceptedServiceConditions),
	  statusCode: {
	    200: function(response) {
	    	$('#serviceConditionsPanel').modal('toggle');
	    }
	  }  
	});
}