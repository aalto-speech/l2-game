// #################################### environment variables
var session = {};
var dropDownMenuTimers = [];
var school = "";
var staff = {};
var classrooms = [];
var currentClassroomId = "";
var currentClassroomName = "";
var students = [];
var currentOpenStudent = "";
var entryToDelete = {};
var serviceConditions = {};

var noCharacterDataURI;
var CharacterDataURI_0;
var CharacterDataURI_1;
var CharacterDataURI_2;
var CharacterDataURI_3;

function openStaff(){
	// clear dom of existing content
	var page = document.getElementById('page');
	var content = document.getElementById('content');
	
	page.removeChild(content);
	
	content = document.createElement("div");
	content.id = 'content';

	var invitationBtn = document.createElement('div');
	invitationBtn.id = 'invitationBtn';
	content.appendChild(invitationBtn);

	// Temporary remove Headmaster section as during PILOTS no DIRECTORS are DEFINED
	
	// var headmasterTitle = document.createElement('h1');
	// headmasterTitle.textContent = 'Headmasters';
	// content.appendChild(headmasterTitle);

	// var directorContent = document.createElement('div');
	// directorContent.id = 'directorContent';
	// content.appendChild(directorContent);

	var teachersTitle = document.createElement('h1');
	teachersTitle.textContent = 'Teachers';
	content.appendChild(teachersTitle);

	var teacherContent = document.createElement('div');
	teacherContent.id = 'teacherContent';
	content.appendChild(teacherContent);

	//create button for creating new teacher entry
	var newTeacherBtn = document.createElement("div");
	newTeacherBtn.id = "newTeacherBtn";
	newTeacherBtn.className = "btn btn-default addEntry";
	newTeacherBtn.textContent = "+ New teacher";
	newTeacherBtn.addEventListener("click", function(event){
		$("#newTeacherCreateBtn").css("display", "none");
		$('#newTeacherPanel').modal('toggle');
	}, false);
	invitationBtn.appendChild(newTeacherBtn);

	page.appendChild(content);
	
}

function renderStaff(){
	// Temporary remove Headmaster section as during PILOTS no DIRECTORS are DEFINED

	// var directorContent = document.getElementById('directorContent');
	var teacherContent = document.getElementById('teacherContent');
	// directorContent.innerHTML = '';
	teacherContent.innerHTML = '';
	// if('director' in staff){
	// 	//for every director render a button/tab
	// 	for (var i = 0; i < staff.director.length; i++) {
	// 		//closure start
	// 		(function (i) {
	// 			var newPanelWrap = document.createElement("div");
	// 			newPanelWrap.className = "panel panel-default";
	// 			var newPanelBody = document.createElement("div");
	// 			newPanelBody.className = "panel-body";
	// 			newPanelBody.textContent = staff.director[i].email;
	// 			newPanelWrap.appendChild(newPanelBody);
	// 			// setTimeout(function(){ contentD.appendChild(newPanelWrap); }, i*100);
	// 			directorContent.appendChild(newPanelWrap);
	// 		}).call(this, i); //closure end	
	// 	}		
	// }

	
	if('teacher' in staff){
		//for every teacher render a button/tab
		for (var i = 0; i < staff.teacher.length; i++) {
			//closure start
			(function (i) {
				var newPanelWrap = document.createElement("div");
				newPanelWrap.className = "panel panel-default";
				var newPanelBody = document.createElement("div");
				newPanelBody.className = "panel-body";
				newPanelBody.textContent = staff.teacher[i].email;
				newPanelWrap.appendChild(newPanelBody);
				// setTimeout(function(){ contentT.appendChild(newPanelWrap); }, i*100);
				teacherContent.appendChild(newPanelWrap);
			}).call(this, i); //closure end	
		}		
	}

}

function openClassrooms(){
	// clear dom of existing content
	var page = document.getElementById('page');
	var content = document.getElementById('content');
	page.removeChild(content);
	content = document.createElement("div");
	content.id = 'content';
	var fragment = document.createDocumentFragment();
	fragment.appendChild(content);
	//create button for creating new teacher entry
	var newClassRoomBtn = document.createElement("div");
	newClassRoomBtn.id = "newClassRoomBtn";
	newClassRoomBtn.className = "btn btn-default addEntry";
	newClassRoomBtn.textContent = "+ New classroom";
	newClassRoomBtn.addEventListener("click", function(event){
		$('#newClassroomPanel').modal('toggle');
		$("#newClassroomCreateBtn").css("display", "none");
		checkClassroomLimits();
	}, false);
	content.appendChild(newClassRoomBtn);

	// create title to content
	var contentTitleWrap = document.createElement("div");
	contentTitleWrap.className = "classroomTitleWrap";
	var contentTitle = document.createElement("h1");
	contentTitle.className = "classroomTitle";
	contentTitle.textContent = "Classrooms";
	var classroomLimitsText = document.createElement("span");
	classroomLimitsText.id ="classroomLimitIndicator";
	classroomLimitsText.className = "classroomTitleLimits";
	contentTitle.appendChild(classroomLimitsText);
	contentTitleWrap.appendChild(contentTitle);
	content.appendChild(contentTitleWrap);

	page.appendChild(fragment);
}

function renderClassrooms(){
	var classroomLimitsIndicator = document.getElementById('classroomLimitIndicator');
	classroomLimitsIndicator.innerHTML = classrooms.length+'/'+school.subscription[0].classroomLimit;

	var content = document.getElementById('content');
	var fragment = document.createDocumentFragment();
	var list = document.createElement("div");
	list.id = 'classroomList';
	fragment.appendChild(list);

	for (var i = 0; i < classrooms.length; i++) {
		(function (i) {
			list.appendChild(renderClassroom(classrooms[i]));
		}).call(this, i);
	}

	content.appendChild(fragment);
}

function renderClassroom(classroom){
		var newPanelWrap = document.createElement("div");
		newPanelWrap.id = classroom.id;
		newPanelWrap.className = "panel panel-default";
		var newPanelBody = document.createElement("div");
		newPanelBody.className = "panel-body classroomPanel";
		newPanelBody.textContent = classroom.name;
		var newBtn = document.createElement("div");
		newBtn.className = "panelItemDeletionBtn";
		newBtn.textContent = 'x';
		newPanelBody.appendChild(newBtn);
		newPanelBody.addEventListener("click", function(event){
			getStudents(classroom.id, classroom.name);
		}, false);
		newBtn.addEventListener("click", function(event){
				deleteClassroomDialog(classroom);
				event.stopPropagation();
			}, false);
		newPanelWrap.appendChild(newPanelBody);

		return newPanelWrap;
}

function openClassroom(classroomId,classroomName){
	currentClassroomId = classroomId;
	currentClassroomName = classroomName;
	// clear existing content
	var page = document.getElementById('page');
	var content = document.getElementById('content');
	page.removeChild(content);
	var fragment = document.createDocumentFragment();
	content = document.createElement("div");
	content.id = 'content';
	fragment.appendChild(content);

	//create button for creating new student entry
	var newStudentBtn = document.createElement("div");
	newStudentBtn.id = "newStudentBtn";
	newStudentBtn.className = "btn btn-default addEntry"
	newStudentBtn.textContent = "+ New student"
	newStudentBtn.addEventListener("click", function(event){
		$('#newStudentOptionsPanel').modal('toggle');
		checkStudentsLimits();
	}, false);
	content.appendChild(newStudentBtn);

	//add title referancing the entered classroom
	var contentTitle = document.createElement("h1");
	contentTitle.textContent = "Classroom "+classroomName;
	var studentLimitText = document.createElement("span");
	studentLimitText.id ="studentLimitIndicator";
	studentLimitText.className = "classroomTitleLimits";
	contentTitle.appendChild(studentLimitText);
	content.appendChild(contentTitle);
	page.appendChild(fragment);

}

function renderStudents(){
	var studentLimitIndicator = document.getElementById('studentLimitIndicator');
	studentLimitIndicator.innerHTML = students.length+'/'+school.subscription[0].studentLimit;
	
	var content = document.getElementById('content');
	var fragment = document.createDocumentFragment();
	var list = document.createElement("div");
	list.id = 'studentList';
	fragment.appendChild(list);
	
	
	for (var i = 0; i < students.length; i++) {
		(function (i) {
			list.appendChild(renderStudent(students[i]));
		}).call(this, i);
	}
	
    content.appendChild(fragment);
}

function renderStudent(student){
	var fragment = document.createDocumentFragment();
	var card = document.createElement("div");
	card.id = student.id; 
	card.className = "card";
	fragment.appendChild(card);
	var newBtn = document.createElement("div");
	newBtn.className = "cardDeletionBtn";
	newBtn.textContent = 'x';
	card.appendChild(newBtn);
	var avatar = document.createElement("img");
	if(student['game-state']['character']){
		avatar.src = window['CharacterDataURI_'+student['game-state']['character']];
	}else{
		// avatar.src = "static/media/images/noCharacter.png";
		 avatar.src = noCharacterDataURI;
	}	
	avatar.className = "card-avatar";
	card.appendChild(avatar);
	var cardBody = document.createElement("div");
	cardBody.className = "card-body";
	var cardText = document.createElement("h5");
	cardText.className = "card-title";
	// cardText.textContent = student.name;
	cardText.textContent = (student.name === "Sem nome") ? student.username : student.name;
	cardBody.appendChild(cardText);
	card.appendChild(cardBody);

	var progressHear = 0;
	var progressRepeat = 0;
	var progressMemorize = 0;

	if(student['progress']){
		progressHear = student['progress']['words']['seen'];
		progressRepeat = student['progress']['words']['repeated'];
		progressMemorize = student['progress']['words']['memorized'];
	}	

	// var blockStatusHear = document.createElement('div');
	// blockStatusHear.className = 'blockStatus';
	// card.appendChild(blockStatusHear);
	// blockStatusHear.innerHTML = '<i class="fas fa-headphones"></i> <span class="progressCount">'+progressHear+'</span>';

	// var blockStatusRepeat = document.createElement('div');
	// blockStatusRepeat.className = 'blockStatus';
	// card.appendChild(blockStatusRepeat);
	// blockStatusRepeat.innerHTML = '<i class="fas fa-microphone"></i> <span class="progressCount">'+progressRepeat+'</span>';

	// var blockStatusMemorized = document.createElement('div');
	// blockStatusMemorized.className = 'blockStatus';
	// card.appendChild(blockStatusMemorized);
	// blockStatusMemorized.innerHTML = '<i class="fas fa-brain"></i> <span class="progressCount">'+progressMemorize+'</span>';

	var blockStatusHear = document.createElement('div');
	blockStatusHear.className = 'blockStatus';
	var iconHear = document.createElement('i');
	iconHear.className = 'fas fa-headphones';
	blockStatusHear.appendChild(iconHear);
	var countHear = document.createElement('span');
	countHear.className = 'progressCount';
	countHear.textContent = progressHear;
	blockStatusHear.appendChild(countHear);
	card.appendChild(blockStatusHear);

	var blockStatusRepeat = document.createElement('div');
	blockStatusRepeat.className = 'blockStatus';
	var iconRepeat = document.createElement('i');
	iconRepeat.className = 'fas fa-microphone';
	blockStatusRepeat.appendChild(iconRepeat);
	var countRepeat = document.createElement('span');
	countRepeat.className = 'progressCount';
	countRepeat.textContent = progressRepeat;
	blockStatusRepeat.appendChild(countRepeat);
	card.appendChild(blockStatusRepeat);

	var blockStatusMemorized = document.createElement('div');
	blockStatusMemorized.className = 'blockStatus';
	var iconMemorized = document.createElement('i');
	iconMemorized.className = 'fas fa-brain';
	blockStatusMemorized.appendChild(iconMemorized);
	var countMemorized = document.createElement('span');
	countMemorized.className = 'progressCount';
	countMemorized.textContent = progressMemorize;
	blockStatusMemorized.appendChild(countMemorized);
	card.appendChild(blockStatusMemorized);

	card.addEventListener("click", function(event){
		openStudent(student);
	}, false);
	newBtn.addEventListener("click", function(event){
		deleteStudentDialog(student);
		event.stopPropagation();
	}, false);

	// fragment.appendChild(card);
	return fragment;
}

function openStudent(student){
	currentOpenStudent = student;
	studentTitle.innerHTML = student.name;
	$('#studentDetailsPanel').modal('toggle');
  	studentContent.innerHTML = '<div id="studentContentAccountInfoWrap"><h4>Account information</h4><div class="studentInfoWrapper"><div class="studentInfoBlock"><i class="fas fa-user studentInfoIcon"></i><p class="studentInfoText">Username:'+student.username+'</p></div><div class="studentInfoBlock"><i class="fas fa-key studentInfoIcon"></i><p class="studentInfoText">Password:'+student.password+'</p></div><div class="studentInfoBlock"><i class="fas fa-file-signature studentInfoIcon"></i><p class="studentInfoText">Consent:'+student.consent.consent+'</p></div></div></div><div id="studentContentProgressAllWordsWrap"><h4>Progress: All words</h4></div><div id="studentContentProgressGroupsWrap"><h4>Progress: Word groups</h4></div>';

  	if(student['progress']){
  		var table = document.createElement('table');
  		table.className = 'table progressTable';
  		studentContentProgressAllWordsWrap.appendChild(table);
  		
		var tableHeaderRow = document.createElement('tr');
		
  		var th1 = document.createElement('th');
  		var th2 = document.createElement('th');
  		var th3 = document.createElement('th');	

  		var createIcon1 = document.createElement('i');
  		createIcon1.className = "fas fa-headphones";
  		th1.appendChild(createIcon1);

  		var createIcon2 = document.createElement('i');
  		createIcon2.className = "fas fa-microphone";
  		th2.appendChild(createIcon2);

  		var createIcon3 = document.createElement('i');
  		createIcon3.className = "fas fa-brain";
  		th3.appendChild(createIcon3);
		
		var newText  = document.createTextNode('   Heard');
		th1.appendChild(newText);
		
		var newText  = document.createTextNode('   Repeated (score: +3)');
		th2.appendChild(newText);
		
		var newText  = document.createTextNode('   Memorized');
		th3.appendChild(newText);

		tableHeaderRow.appendChild(th1);
		tableHeaderRow.appendChild(th2);
		tableHeaderRow.appendChild(th3);

		table.appendChild(tableHeaderRow);

		var row = document.createElement('tr');
		
  		var td1 = document.createElement('td');
  		var td2 = document.createElement('td');
  		var td3 = document.createElement('td');
		
		var newText1  = document.createTextNode(student['progress']['words']['seen']);
		td1.appendChild(newText1);
		row.appendChild(td1);
		
		var newText2  = document.createTextNode(student['progress']['words']['repeated']);
		td2.appendChild(newText2);
		row.appendChild(td2);
		
		var newText3  = document.createTextNode(student['progress']['words']['memorized']);
		td3.appendChild(newText3);
		row.appendChild(td3);

		table.appendChild(row);

  	}else{
  		studentContentProgressAllWordsWrap.innerHTML += 'No progress to show';
  	}
  	
  	if(student['progress']){
  		var table = document.createElement('table');
  		table.className = 'table progressTable';
  		studentContentProgressGroupsWrap.appendChild(table);
		
		var tableHeaderRow = document.createElement('tr');
		
  		var th1 = document.createElement('th');
  		var th2 = document.createElement('th');
  		var th3 = document.createElement('th');	

  		var createIcon1 = document.createElement('i');
  		createIcon1.className = "fas fa-layer-group";
  		th1.appendChild(createIcon1);

  		var createIcon2 = document.createElement('i');
  		createIcon2.className = "fas fa-star";
  		th2.appendChild(createIcon2);

  		var createIcon3 = document.createElement('i');
  		createIcon3.className = "fas fa-brain";
  		th3.appendChild(createIcon3);		

		var newText  = document.createTextNode('   Group');
		th1.appendChild(newText);
		var newText  = document.createTextNode('   Mean score');
		th2.appendChild(newText);
		var newText  = document.createTextNode('   Memorized');
		th3.appendChild(newText);

		tableHeaderRow.appendChild(th1);
		tableHeaderRow.appendChild(th2);
		tableHeaderRow.appendChild(th3);

		table.appendChild(tableHeaderRow);

  		for (i = 0; i < student['progress']['modules'].length; i++) {
		    (function (i) {
				var newRow   = document.createElement('tr');
				newRow.className = 'progressGroupLink';
				newRow.addEventListener("click", function(event){
					openStudentGroupProgress(student['progress']['modules'][i]);
				}, false);

				var newCell1  = document.createElement('td');
				var newText1  = document.createTextNode(student['progress']['modules'][i]['theme']);
				newCell1.appendChild(newText1);
				newRow.appendChild(newCell1);

				var newCell2  = document.createElement('td');
				var rounded = Math.round(student['progress']['modules'][i]['score'] * 10) / 10;
				var newText2  = document.createTextNode(rounded);
				newCell2.appendChild(newText2);
				newRow.appendChild(newCell2);

				var newCell3  = document.createElement('td');
				var percent = student['progress']['modules'][i]['memorized'] * 100;
				var newText3  = document.createTextNode(percent+' %');
				newCell3.appendChild(newText3);
				newRow.appendChild(newCell3);

				table.appendChild(newRow);

			}).call(this, i); //closure end	
		}

  	}else{
  		studentContentProgressGroupsWrap.innerHTML += 'No progress to show';
  	}
}

function openStudentGroupProgress(group){
	$('#studentDetailsPanel').modal('toggle');
	$('#studentGroupProgressPanel').modal('toggle');
	groupProgressTitle.innerHTML = group.theme;
	groupProgressContent.innerHTML = '';

	var table = document.createElement('table');
	table.className = 'table progressTable';
	groupProgressContent.appendChild(table);

	var tableHeaderRow = document.createElement('tr');

	var th1 = document.createElement('th');
	var th2 = document.createElement('th');
	var th3 = document.createElement('th');	
	var th4 = document.createElement('th');	

	var newText1  = document.createTextNode('Word');
	th1.appendChild(newText1);
	var newText2  = document.createTextNode('Repeats');
	th2.appendChild(newText2);
	var newText3  = document.createTextNode('Best score');
	th3.appendChild(newText3);
	var newText4  = document.createTextNode('Memorized');
	th4.appendChild(newText4);

	tableHeaderRow.appendChild(th1);
	tableHeaderRow.appendChild(th2);
	tableHeaderRow.appendChild(th3);
	tableHeaderRow.appendChild(th4);

	table.appendChild(tableHeaderRow);

	var stars_conf = [];

	for (i = 0; i < group.words.length; i++) {
		var newRow   = document.createElement('tr');

		var newCell1  = document.createElement('td');
		var newText1  = document.createTextNode(group.words[i]['word']);
		newCell1.appendChild(newText1);
		newRow.appendChild(newCell1);

		var newCell2  = document.createElement('td');
		var newText2  = document.createTextNode(group.words[i]['repeats']);
		newCell2.appendChild(newText2);
		newRow.appendChild(newCell2);

		var newCell3  = document.createElement('td');
		var star = document.createElement('div');
		star.id = group.words[i]['word'].replace(/ /g,'')+'_stars';
		star.className = 'stars_rating';
		newCell3.appendChild(star);
		if(group.words[i]['best_score']<0){
			stars_conf.push({'id':star.id,'score':0});
		}else{
			stars_conf.push({'id':star.id,'score':group.words[i]['best_score']});
		}
		newRow.appendChild(newCell3);

		var newCell4  = document.createElement('td');
		if(group.words[i]['memorized']){	
			var icon = document.createElement('i');
			icon.className = "fas fa-check colorChecked";
			newCell4.appendChild(icon);
		}else{
			var icon = document.createElement('i');
			icon.className = "fas fa-times colorNotChecked";
			newCell4.appendChild(icon);		
		}

		newRow.appendChild(newCell4);

		table.appendChild(newRow);
	}

	fillStars(stars_conf);
}

function fillStars(stars_conf){

	for (i = 0; i < stars_conf.length; i++) {
		$('#'+stars_conf[i].id).rateYo({
		    rating    : stars_conf[i].score,
		    spacing   : "5px",
		    readOnly: true
		});
	}

}

function deleteStudentDialog(student){
	entryToDelete = student;
	deleteStudentSubmitMessage.innerHTML = '';
	$('#deleteStudentPanel').modal('toggle');
	deleteStudentMessage.innerHTML = '"You are about to delete student: '+student.name+'"';
}

function deleteClassroomDialog(classroom){
	entryToDelete = classroom;
	deleteClassroomSubmitMessage.innerHTML = '';
	$('#deleteClassroomPanel').modal('toggle');
	deleteClassroomMessage.innerHTML = '"You are about to delete classroom: '+classroom.name+', among all its students"';
}

function checkClassroomLimits(){
	var classroomForm = document.getElementById("newClassroomPanel").getElementsByClassName("modal-body")[0];
	var maxClassrooms = parseInt(school.subscription[0].classroomLimit);
	if (classrooms.length >= maxClassrooms) {
		$("#newClassroomPanelTitle").css("display", "none");
		classroomForm.style.display = 'none';
		newClassroomSubmitMsg.innerHTML = '"you have exceeded the limit of '+maxClassrooms+' classrooms per school"';
	}else{
		$("#newClassroomPanelTitle").css("display", "block");
		classroomForm.style.display = 'block';
		newClassroomSubmitMsg.innerHTML = '';
	}
}

function checkStudentsLimits(){
	var studentsOptionsForm = document.getElementById("newStudentOptionsPanel").getElementsByClassName("modal-body")[0];
	var maxStudents = parseInt(school.subscription[0].studentLimit);
	if (students.length >= maxStudents) {
		studentsOptionsForm.style.display = 'none';
		newStudentOptionPanelMsg.innerHTML = '"limit of '+maxStudents+' students per classroom has been exceeded"';
	}else{
		studentsOptionsForm.style.display = 'block';
		newStudentOptionPanelMsg.innerHTML = '';
	}
}

function generateClassroomLink(){
	var room = _.find(classrooms, function(classroom){ 
		return classroom.name == currentClassroomName; 
	});
	var link = 'https://FIX_HARDCODED_URL_HERE_PLEASE/joinclassroom?id='+room.id+'&lang='+school.language;
	$("#classroomLink").val(link);
}

function copyClassroomLinkToClipboard(){
	$("#classroomLink").select();
	document.execCommand('copy');
}

function renderSchoolName(name){
	var nameTag = document.getElementById('schoolNameTag');
	nameTag.style.display = 'block';
	var text = document.createTextNode('| '+name);
	nameTag.appendChild(text);

}

function message(msg,duration){
	var paragraph = document.createElement("p");
	paragraph.className = "msgFlash";
	paragraph.id = generateUUID();
	var textNode = document.createTextNode(msg);
	paragraph.appendChild(textNode);
	messageBox.appendChild(paragraph);
	setTimeout(function(){
		var string = '#'+String(paragraph.id);
		$(string).fadeOut('slow');
	},duration);
}

function validateNewTeacherForm(){
	newTeacherSubmitMsg.innerHTML = '';
	var newTeacherFormEmailValid = $('#newTeacherEmailInput').data('data-valid');
	if(newTeacherFormEmailValid){
		$("#newTeacherCreateBtn").css("display", "block");
	}else{
		$("#newTeacherCreateBtn").css("display", "none");
	}
}

function validateNewClassroomForm(){
	newClassroomSubmitMsg.innerHTML = '';
	var newClassroomFormNameValid = $('#newClassroomNameInput').data('data-valid');
	if(newClassroomFormNameValid){
		$("#newClassroomCreateBtn").css("display", "block");
	}else{
		$("#newClassroomCreateBtn").css("display", "none");
	}
}

function validateNewStudentForm(){
	newStudentSubmitMsg.innerHTML = '';
	var newStudentFormNameValid = $('#newStudentNameInput').data('data-valid');
	var newStudentFormGuardianValid = $('#newStudentGuardianInput').data('data-valid');
	if(newStudentFormNameValid && newStudentFormGuardianValid){
		$("#newStudentCreateBtn").css("display", "block");
	}else{
		$("#newStudentCreateBtn").css("display", "none");
	}
}

function validateServiceConditionsForm(){
	if($("#termsOfServiceCheckBox").prop('checked') && $("#privacyPolicyCheckBox").prop('checked')){
		//show accept btn
		$("#acceptServiceConditionsBtn").css("display", "block");
	}else{
		//hide accept btn
		$("#acceptServiceConditionsBtn").css("display", "none");
	}
}

function updateFormElementValidityStyle(element,state,message){
	console.log(element);
	if(message){
		$('#'+element+'-validity-message').text(message);
	}else{
		$('#'+element+'-validity-message').text('');
	}
	switch (state) {
	  case 'unknown':
	    $('#'+element+"-validity-icon").removeClass().addClass('fas fa-satellite-dish formElementValidityIcon formElementValidityIconInvalid');
	    break;
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

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function random5digits() {
	return Math.floor(Math.random()*90000) + 10000;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function getDataURI(img) {
   // Create canvas
   var canvas = document.createElement('canvas');
   var ctx = canvas.getContext('2d', {alpha: false});
   // Set width and height
   canvas.width = img.width;
   canvas.height = img.height;
   // Draw the image
   ctx.fillStyle = "white";
   ctx.fillRect(0, 0, img.width, img.height);
   ctx.drawImage(img, 0, 0);
   
   return canvas.toDataURL('image/jpeg');
};

function loadStaticImages(){
	var img_noCharacter = document.createElement("img");
	img_noCharacter.src = "static/media/images/noCharacter.png";
	img_noCharacter.addEventListener('load', function (event) {
	   noCharacterDataURI = getDataURI(event.currentTarget);
	});

	var img_0Character = document.createElement("img");
	img_0Character.src = "static/media/images/character_0.png";
	img_0Character.addEventListener('load', function (event) {
	   CharacterDataURI_0 = getDataURI(event.currentTarget);
	});

	var img_1Character = document.createElement("img");
	img_1Character.src = "static/media/images/character_1.png";
	img_1Character.addEventListener('load', function (event) {
	   CharacterDataURI_1 = getDataURI(event.currentTarget);
	});

	var img_2Character = document.createElement("img");
	img_2Character.src = "static/media/images/character_2.png";
	img_2Character.addEventListener('load', function (event) {
	   CharacterDataURI_2 = getDataURI(event.currentTarget);
	});

	var img_3Character = document.createElement("img");
	img_3Character.src = "static/media/images/character_3.png";
	img_3Character.addEventListener('load', function (event) {
	   CharacterDataURI_3 = getDataURI(event.currentTarget);
	});
}

