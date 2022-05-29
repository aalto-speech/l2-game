// #################################### environment variables
var session = {};
var admins = [];
var distributors = []; 
var directors =[];
var teachers = []; 
var schools = [];
var multiSchoolsAndTeachers;
var notifications = [];
var consumers = [];
var consumersJSON;
var emailValid = false;
var schoolValid = false;
var dateValid = false;
var notificationValid = false;
var languageValid = false;
var textValid = false;
var htmlValid = false;
var multiJsonValid = false;
var classroomLimitValid = false;
var studentLimitValid = false;
var studentUsernameValid = false;
var numberAccountsValid = false;
var entryToDelete = "";
var entryToEdit = {};

// #################################### functions
function deleteAdminDialog(id){
	$('#deleteAdminPanel').modal('toggle');
	deleteAdminMessage.innerHTML = "You are about to delete user "+id;
	entryToDelete = id;
}

function deleteDistributorDialog(id){
	$('#deleteDistributorPanel').modal('toggle');
	deleteDistributorMessage.innerHTML = "You are about to delete user "+id;
	entryToDelete = id;
}

function deleteSchoolDialog(id){
	$('#deleteSchoolPanel').modal('toggle');
	deleteSchoolMessage.innerHTML = "You are about to delete school "+id;
	entryToDelete = id;
}

function deleteNotificationDialog(id){
	$('#deleteNotificationPanel').modal('toggle');
	deleteNotificationMessage.innerHTML = "You are about to delete notification "+id;
	entryToDelete = id;
}

function deleteDirectorDialog(id){
	$('#deleteDirectorPanel').modal('toggle');
	deleteDirectorMessage.innerHTML = "You are about to delete user "+id;
	entryToDelete = id;
}

function deleteTeacherDialog(id){
	$('#deleteTeacherPanel').modal('toggle');
	deleteTeacherMessage.innerHTML = "You are about to delete user "+id;
	entryToDelete = id;
}

function deleteConsumerDialog(id){
	$('#deleteConsumerPanel').modal('toggle');
	deleteConsumerMessage.innerHTML = "You are about to delete user "+id;
	entryToDelete = id;
}

function editSchoolDialog(school){
	entryToEdit = school;
	$('#editSchoolPanel').modal('toggle');
	// init form values
	$("#editSchoolNameInput").val(school.name);
	populateLanguageSelection(editSchoolLanguageInput);
	$("#editSchoolLanguageInput").val(school.language);
	// init datepicker on school edit form
	$('#editSchoolInputSubscriptionStartDate').datepicker({
	  format: 'yyyy-mm-dd',
	  orientation: 'bottom'
	});
	// init datepicker on school edit form
	$('#editSchoolInputSubscriptionEndDate').datepicker({
	  format: 'yyyy-mm-dd',
	  orientation: 'bottom'
	});
	$('#editSchoolInputSubscriptionStartDate').datepicker('update', school.subscription_start);
	$('#editSchoolInputSubscriptionEndDate').datepicker('update', school.subscription_end);
	$("#editSchoolClassroomLimit").val(school.subscription[0].classroomLimit);
	$("#editSchoolStudentLimit").val(school.subscription[0].studentLimit);
	console.log(school);
}

function renderAdmins(admins){
	var deleteIcon = function(cell, formatterParams){ 
    	return "<i class='far fa-trash-alt'></i>";
	};

	var tableAdmins = new Tabulator("#admins-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:admins,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"email", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"email", field:"email"},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteAdminDialog(cell.getRow().getData().id)}},
		],
	});
}

function renderDistributors(distributors){
	var deleteIcon = function(cell, formatterParams){ 
    	return "<i class='far fa-trash-alt'></i>";
	};

	var tableAdmins = new Tabulator("#distributors-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:distributors,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"email", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"email", field:"email"},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteDistributorDialog(cell.getRow().getData().id)}},
		],
	});
}

function renderSchools(schools){
	var deleteIcon = function(cell, formatterParams){ //plain text value
    	return "<i class='far fa-trash-alt'></i>";
	};
	var editIcon = function(cell, formatterParams){ //plain text value
    	return "<i class='fas fa-pencil-alt'></i>";
	};
	console.log('_____________________________________________________');
	console.log(schools);
	for(var i=0; i<schools.length; i++){
		schools[i]['subscription_start'] = schools[i]['subscription'][0]['start'];
		schools[i]['subscription_end'] = schools[i]['subscription'][0]['end'];
	}
	var tableAdmins = new Tabulator("#schools-table", {
		height:"261px",
		width:"90%",
		movableRows:false,
		data:schools,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		selectable:false,
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:false,      //allow column order to be changed
		resizableRows:false,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"name", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"school", field:"name"},
			{title:"language", field:"language"},
			{title:"subscription start", field:"subscription_start", sorter:"date", sorterParams:{format:"YYYY-MM-DD"}},
			{title:"subscription end", field:"subscription_end", sorter:"date", sorterParams:{format:"YYYY-MM-DD"}},
			{title:"classroom limit", field:"subscription",
				formatter:function(cell, formatterParams, onRendered){
  					return cell._cell.value[0]['classroomLimit']; 
			}},
			{title:"student limit", field:"subscription",
				formatter:function(cell, formatterParams, onRendered){
  					return cell._cell.value[0]['studentLimit']; 
			}},
			{title:"edit", formatter:editIcon, width:90, align:"center", cellClick:function(e, cell){editSchoolDialog(cell.getRow().getData())}},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteSchoolDialog(cell.getRow().getData().id)}}
		],
	});
}

function renderNotifications(notifications){
	var deleteIcon = function(cell, formatterParams){ //plain text value
    return "<i class='far fa-trash-alt'></i>";
	};
	var tableAdmins = new Tabulator("#notifications-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:notifications,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"type", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"type", field:"type"},
			{title:"language", field:"language"},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteNotificationDialog(cell.getRow().getData().id)}},
		],
	});
}

function renderDirectors(directors){
	var deleteIcon = function(cell, formatterParams){ //plain text value
    return "<i class='far fa-trash-alt'></i>";
	};
	var tableDirectors = new Tabulator("#directors-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:directors,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"email", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"email", field:"email"},
			{title:"role", field:"role"},
			{title:"school", field:"schoolName",
				formatter:function(cell, formatterParams, onRendered){
  					return cell._cell.value[0].name; 
			}},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteDirectorDialog(cell.getRow().getData().id)}},
		],
	});
}

function renderTeachers(teachers){
	var deleteIcon = function(cell, formatterParams){ //plain text value
    return "<i class='far fa-trash-alt'></i>";
	};
	var tableTeachers = new Tabulator("#teachers-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:teachers,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"email", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"school-id", field:"school"},
			{title:"email", field:"email"},
			{title:"role", field:"role"},
			{title:"school", field:"schoolName",
				formatter:function(cell, formatterParams, onRendered){
  					return cell._cell.value[0].name; 
			}},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteTeacherDialog(cell.getRow().getData().id)}},
		],
	});
}

function renderConsumers(consumers){
	var deleteIcon = function(cell, formatterParams){ //plain text value
    return "<i class='far fa-trash-alt'></i>";
	};
	var tableTeachers = new Tabulator("#consumers-table", {
		height:"261px",
		width:"90%",
		movableRows:true,
		data:consumers,               //load row data from array
		reactiveData:true,
		layout:"fitColumns",      //fit columns to width of table
		responsiveLayout:"hide",  //hide columns that dont fit on the table
		tooltips:true,            //show tool tips on cells
		addRowPos:"top",          //when adding a new row, add it to the top of the table
		history:true,             //allow undo and redo actions on the table
		pagination:"local",       //paginate the data
		paginationSize:5,         //allow 7 rows per page of data
		movableColumns:true,      //allow column order to be changed
		resizableRows:true,       //allow row order to be changed
		initialSort:[             //set the initial sort order of the data
			{column:"email", dir:"asc"},
		],
		columns:[                 //define the table columns
			{title:"id", field:"id"},
			{title:"username", field:"username"},
		    {title:"delete", formatter:deleteIcon, width:90, align:"center", cellClick:function(e, cell){deleteConsumerDialog(cell.getRow().getData().id)}},
		],
	});
}

function populateSchoolSelection(target){
	target.innerHTML = '<option value="" selected disabled hidden>Choose school</option>';
	for(var i=0; i<schools.length; i++){
		var option = document.createElement("option");
		option.text = schools[i].name;
		option.value = schools[i].id;
		target.appendChild(option);
	}
}

function populateLanguageSelection(target){
	target.innerHTML = '<option value="" selected disabled hidden>Choose language</option>';
	languages = ['English', 'Portuguese'];
	for(var i=0; i<languages.length; i++){
		var option = document.createElement("option");
		option.text = languages[i];
		option.value = languages[i];
		target.appendChild(option);
	}
}

function populateNotificationSelection(target){
	target.innerHTML = '<option value="" selected disabled hidden>Choose notification</option>';
	languages = ['Consent','Invitation'];
	for(var i=0; i<languages.length; i++){
		var option = document.createElement("option");
		option.text = languages[i];
		option.value = languages[i];
		target.appendChild(option);
	}
}

function validateNewDirectorFrom(){
	if(emailValid && schoolValid){
		$("#newDirectorCreateBtn").css("display", "block");
	}else{
		$("#newDirectorCreateBtn").css("display", "none");
	}
}

function validateNewTeacherFrom(){
	if(emailValid && schoolValid){
		$("#newTeacherCreateBtn").css("display", "block");
	}else{
		$("#newTeacherCreateBtn").css("display", "none");
	}
}

function validateNewAdminFrom(){
	if(emailValid){
		$("#newAdminCreateBtn").css("display", "block");
	}else{
		$("#newAdminCreateBtn").css("display", "none");
	}
}

function validateNewDistributorFrom(){
	if(emailValid){
		$("#newDistributorCreateBtn").css("display", "block");
	}else{
		$("#newDistributorCreateBtn").css("display", "none");
	}
}

function validateNewNotificationFrom(){
	if(notificationValid && languageValid && textValid && htmlValid){
		$("#newNotificationCreateBtn").css("display", "block");
	}else{
		$("#newNotificationCreateBtn").css("display", "none");
	}
}

function validateNewSchoolForm(){
	if(schoolValid && languageValid && dateValid && classroomLimitValid && studentLimitValid){
		$("#newSchoolCreateBtn").css("display", "block");
	}else{
		$("#newSchoolCreateBtn").css("display", "none");
	}
}

function validateEditSchoolForm(){
	if(schoolValid && classroomLimitValid && studentLimitValid){
		$("#editSchoolUpdateBtn").css("display", "block");
	}else{
		$("#editSchoolUpdateBtn").css("display", "none");
	}
}

function validateNewSchoolMultiForm(){
	if(multiJsonValid && dateValid){
		$("#newSchoolTeacherMultiCreateBtn").css("display", "block");
	}else{
		$("#newSchoolTeacherMultiCreateBtn").css("display", "none");
	}
}

function validateNewTestStudentsForm(){
	var schoolCheck = $('#newTestStudentSchoolInput').data('data-valid');
	var guardianCheck = $('#newTestStudentGuardianInput').data('data-valid');
	var numberAccountsCheck = $('#newTestStudentNumberAccountsInput').data('data-valid');
	var numberClassroomsCheck = $('#newTestStudentNumberClassroomsInput').data('data-valid');
	var nameCheck = $('#newTestStudentNameInput').data('data-valid');

	if(schoolCheck && guardianCheck && numberAccountsCheck && numberClassroomsCheck && nameCheck){
		$("#newTestStudentCreateBtn").css("display", "block");
	}else{
		$("#newTestStudentCreateBtn").css("display", "none");
	}
}

function sortSchoolTeacherJSONData(){
	try {
		sortedSchoolsDiv.innerHTML = "";
		sortedTeachersDiv.innerHTML = "";
		sortedLanguageDiv.innerHTML = "";
		newSchoolTeacherMultiSubmitMsg.innerHTML = '';
		$("#newSchoolTeacherMultiCreateBtn").css("display", "none");
		// from string to JSON
	  	multiSchoolsAndTeachers = JSON.parse($("#schoolTeacherMultiInput").val());
	  	// remove duplicated teacher fields
	  	multiSchoolsAndTeachers = _.uniq(multiSchoolsAndTeachers, 'teacher');
	  	// filter to object with fields school, teacher and language
	  	multiSchoolsAndTeachers = _.filter(multiSchoolsAndTeachers,  function(item){  
            return _.has(item, "school") && _.has(item, "teacher") && _.has(item, "language") 
        });
	  	// grop by school
	  	multiSchoolsAndTeachers =_
			.chain(multiSchoolsAndTeachers)
			.groupBy('school')
			.map(function(value, key) {
			    return {
			        school: key,
			        teachers: _.pluck(value, 'teacher'),
			        language: firstLetterUppercase(value[0].language)
			    }	
			})
			.value();
		//  sample table render
		for (i = 0; i < multiSchoolsAndTeachers.length; i++) {
		  	sortedSchoolsDiv.innerHTML += multiSchoolsAndTeachers[i].school;
		  	sortedLanguageDiv.innerHTML += multiSchoolsAndTeachers[i].language;
			for (c = 0; c < multiSchoolsAndTeachers[i].teachers.length; c++) {
			  sortedTeachersDiv.innerHTML += multiSchoolsAndTeachers[i].teachers[c] + "<br>";
			  sortedSchoolsDiv.innerHTML += "<br>";
			  sortedLanguageDiv.innerHTML += "<br>";
			}
		}
		// allow submit
		if(multiSchoolsAndTeachers.length>0){
			multiJsonValid = true;
			validateNewSchoolMultiForm();
		}else{
			multiJsonValid = false;
			validateNewSchoolMultiForm();
		}
		console.log(multiSchoolsAndTeachers);
	}
	catch(err) {
		multiJsonValid = false;
		validateNewSchoolMultiForm();
	  	newSchoolTeacherMultiSubmitMsg.innerHTML = '"your JSON data is not well formatted"';
	}
}

function validateConsumerJSONData(){
	newConsumerSubmitMsg.innerHTML = '';
	try {
	  	var arr = JSON.parse($("#consumersInput").val());
	  	console.log(arr);
	  	var invalidEmails = [];
	  	for(var i=0; i<arr.length; i++){
	  		if(!validateEmail(arr[i])){
	  			invalidEmails.push(arr[i]);
	  		}
	  	}
  		if(invalidEmails.length){
  			$("#newConsumerCreateBtn").css("display", "none");
  			newConsumerSubmitMsg.innerHTML = '"the following emails are invalid, please edit them: '+invalidEmails.join()+'"'
  		}else{
  			if(arr.length){
	  			consumersJSON = [];
	  			for(var i=0; i<arr.length; i++){
	  				consumersJSON.push({'email':arr[i], 'password':random5digits()})
	  			}
	  			console.log(consumersJSON);
	  			$("#newConsumerCreateBtn").css("display", "block");
  			}
  			
  		}
	}
	catch(err) {
	  	newConsumerSubmitMsg.innerHTML = '"your JSON data is not well formatted"';
	  	$("#newConsumerCreateBtn").css("display", "none");
	}	
}

function updateFormElementValidityStyle(element,state,message){
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

function firstLetterUppercase(string){
	string = string.toLowerCase();
	return string[0].toUpperCase() + string.substring(1)
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