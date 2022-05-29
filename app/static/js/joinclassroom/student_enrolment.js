var classroomInfo = {};
var joinStudentValid = false;
var joinGuardianValid = false;
$("#newStudentCreateBtn").css("display", "none");
// var url_string = window.location.href;
// var url = new URL(url_string);
// var id = url.searchParams.get("id");
// var chosen_language = url.searchParams.get("lang");
var id = document.URL.replace(/.*id=([^&]*).*|(.*)/, '$1');
var chosen_language = document.URL.replace(/.*lang=([^&]*).*|(.*)/, '$1');
if(chosen_language){
	var l = _.find(translation_languages, function(languageItem) {
	    return languageItem.language == chosen_language; 
	})
	if(l){
		chosen_language = l.language;
	}else{
		chosen_language = 'English';
	}
}else{
	chosen_language = 'English';
}

$(document).ready(function() {
	translateStaticTemplateText(chosen_language);
	getClassroomInfo();
});

$("#languageButton").on("click", function(){
	$('#languagePanel').modal('toggle');
	loadLanguages();
});

$("#newStudentNameInput").on("input", function(){
	if($("#newStudentNameInput").val() != "" ){
		joinStudentValid = true;
		updateFormElementValidityStyle('newStudentNameInput', true);
	}else{
		joinStudentValid = false;
		updateFormElementValidityStyle('newStudentNameInput', 'empty');
	} 
	validateJoinClassroomForm();
});

$("#newStudentGuardianInput").on("input", function(){
	if($("#newStudentGuardianInput").val() != ""){
		if(validateEmail($("#newStudentGuardianInput").val())){
			joinGuardianValid = true;
		updateFormElementValidityStyle('newStudentGuardianInput', true);
	}else{
		joinGuardianValid = false;
		updateFormElementValidityStyle('newStudentGuardianInput', false, joinclassroom_page_translations[chosen_language]['email_invalid_msg']);
	}
		
		
	}else{
		joinGuardianValid = false;
		updateFormElementValidityStyle('newStudentGuardianInput', 'empty');
	}
	validateJoinClassroomForm();
});

$("#newStudentCreateBtn").on("click", function(){
	enrollStudent();
});

function loadLanguages(){
	languagePanelContent.innerHTML = '';
	languagePanelTitle.innerHTML = joinclassroom_page_translations[chosen_language]['language_panel_title'];
	for (var i = 0; i < translation_languages.length; i++) {
		(function (i) {
			var newButton = document.createElement("div");
			newButton.className = "languageOptionBtn";
			newButton.textContent = translation_languages[i].label;
			newButton.addEventListener("click", function(event){
				$('#languagePanel').modal('toggle');
				changeLanguage(translation_languages[i].language);
			}, false);
			languagePanelContent.appendChild(newButton);

		}).call(this, i);
	}
}

function changeLanguage(lang){
	chosen_language = lang;
	translateStaticTemplateText();
}

function translateStaticTemplateText(){
	enrollPanelTitle.innerHTML = joinclassroom_page_translations[chosen_language]['enrol_panel_title'];
	newStudentGuardianInput.placeholder = joinclassroom_page_translations[chosen_language]['guardian_email_input_placeholder'];
	newStudentNameInput.placeholder = joinclassroom_page_translations[chosen_language]['student_name_input_placeholder'];
	newStudentCreateBtn.innerHTML = joinclassroom_page_translations[chosen_language]['enrol_button_text'];
	if($('#newStudentGuardianInput-validity-message').text()){
		$('#newStudentGuardianInput-validity-message').text(joinclassroom_page_translations[chosen_language]['email_invalid_msg']);
	}
	msgRef = newStudentPanelMsg.getAttribute('msg-name');
	if(msgRef != ''){
		newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language][msgRef]+'"';
	}

}

function validateJoinClassroomForm(){
	if(joinStudentValid && joinGuardianValid){
		$("#newStudentCreateBtn").css("display", "block");
	}else{
		$("#newStudentCreateBtn").css("display", "none");
	}
}

function updateFormElementValidityStyle(element,state,message){
	if(message){
		$('#'+element+'-validity-message').text(message);
	}else{
		$('#'+element+'-validity-message').text('');
	}
	switch (state) {
	  case 'empty':
	    $('#'+element+"-validity-icon").removeClass().addClass('formElementValidityIcon');
	    break;
	  case true: 
	    $('#'+element+"-validity-icon").removeClass().addClass('fas fa-check formElementValidityIcon formElementValidityIconValid');
	    break;
	  case false:
	    $('#'+element+"-validity-icon").removeClass().addClass('fas fa-times formElementValidityIcon formElementValidityIconInvalid');
	    break;
	}	
}

function checkStudentsLimits(){
	if (classroomInfo.students >= parseInt(classroomInfo.studentLimit)) {
		$("#classroomEnrolmentForm").css("display", "none");
		newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['full_classroom_msg']+'"';
		newStudentPanelMsg.setAttribute('msg-name', 'full_classroom_msg');
	}else{
		$("#classroomEnrolmentForm").css("display", "block");
		newStudentPanelMsg.innerHTML = '';
		newStudentPanelMsg.setAttribute('msg-name', '');
	}
}

function random5digits() {
	return Math.floor(Math.random()*90000) + 10000;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function getClassroomInfo(){
	$.ajax({
	  type: "POST",
	  url: "/getClassroomInfo/"+id,
	  statusCode: {
		  200: function (response) { 
		  	classroomInfo = response;
		  	checkStudentsLimits();

		  },
		  401: function(response) {
		  	$("#classroomEnrolmentForm").css("display", "none");
			newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['classroom_not_found_msg']+'"';
			newStudentPanelMsg.setAttribute('msg-name', 'classroom_not_found_msg');
		  },
		  404: function(response) {
		  	$("#classroomEnrolmentForm").css("display", "none");
			newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['classroom_not_found_msg']+'"';
			newStudentPanelMsg.setAttribute('msg-name', 'classroom_not_found_msg');
		  },
		  422: function(response) {
		  	$("#classroomEnrolmentForm").css("display", "none");
			newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['classroom_not_found_msg']+'"';
			newStudentPanelMsg.setAttribute('msg-name', 'classroom_not_found_msg');
		  }
	  },
	  dataType: "json"
	});							
}

function enrollStudent(){
	$("#newStudentCreateBtn").prop("disabled",true);
	var newStudent = {};
	newStudent.studentName = $("#newStudentNameInput").val();
	newStudent.studentClassroom = classroomInfo.id;
	newStudent.studentSchool = classroomInfo.school;
	newStudent.studentUsername = $("#newStudentNameInput").val().replace(/\s/g, '');
	newStudent.studentPassword = random5digits().toString();
	newStudent.guardiamEmail = $("#newStudentGuardianInput").val();
	$.ajax({
	  type: "POST",
	  contentType: "application/json; charset=utf-8",
	  url: "/create/student",
	  data: JSON.stringify(newStudent),
	  dataType: "json",
	  statusCode: {
	    200: function(response) {
	    	joinStudentValid = false;
			joinGuardianValid = false;
			$("#classroomEnrolmentForm").css("display", "none");
			newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['enrolled_msg']+'"';
			newStudentPanelMsg.setAttribute('msg-name', 'enrolled_msg');
	    },
	    403: function(response) {
	    	$("#classroomEnrolmentForm").css("display", "none");
			newStudentPanelMsg.innerHTML = '"'+joinclassroom_page_translations[chosen_language]['full_classroom_msg']+'"';			
			newStudentPanelMsg.setAttribute('msg-name', 'full_classroom_msg');

	    }
	  }  
	});						
}
