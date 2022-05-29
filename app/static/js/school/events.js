// ////////////////////////////////////////////////////////////////////////////////////////////////
// Loaders
// ////////////////////////////////////////////////////////////////////////////////////////////////


// When document/page loads get data from server
$(document).ready(function() {
  loadStaticImages();
  getSessionInfo();
  getStaff();
  getSchool();
});


// ////////////////////////////////////////////////////////////////////////////////////////////////
// Navigation
// ////////////////////////////////////////////////////////////////////////////////////////////////


// Toggle menu on menu button click
$("#dropDownMenuBtn").on("click", function(){
    event.stopPropagation();
    // console.log('Timers: '+dropDownMenuTimers.length);
    for (var i = 0; i<dropDownMenuTimers.length; i++) {
      window.clearTimeout(dropDownMenuTimers[i]);
      // console.log('t:'+i);
    };
    dropDownMenuTimers=[];
    if($("#dropDownMenuWrap").css("opacity") == 0){
      // console.log('showing');
      $("#dropDownMenuWrap").removeClass('dropDownMenuWrapHideAnimation').addClass('dropDownMenuWrapShowAnimation');
      dropDownMenuTimers.push(setTimeout(function(){ 
          // console.log('timeout');
          if($("#dropDownMenuWrap").hasClass("dropDownMenuWrapShowAnimation")){
            // console.log('start vibrating');
            $("#dropDownMenuWrap").removeClass('dropDownMenuWrapOpen').addClass('dropDownMenuPulsate');
          } 
      }, 1500));
      dropDownMenuTimers.push(setTimeout(function(){     
          // console.log('timeout');
          if($("#dropDownMenuWrap").hasClass("dropDownMenuWrapShowAnimation")){
            // console.log('closing');
             $("#dropDownMenuWrap").removeClass('dropDownMenuWrapShowAnimation dropDownMenuPulsate dropDownMenuWrapOpen').addClass('dropDownMenuWrapHideAnimation');
          } 
      }, 3000));
    }else{
      console.log('closing');
      $("#dropDownMenuWrap").removeClass('dropDownMenuWrapShowAnimation dropDownMenuWrapOpen').addClass('dropDownMenuWrapHideAnimation');
      if($("#dropDownMenuWrap").hasClass("dropDownMenuPulsate")){
        // console.log('closing_vipr');
        $("#dropDownMenuWrap").removeClass('dropDownMenuPulsate');
      } 
    }
});

$(".dropDownMenuLinkWrap").on("click", function(){
    // avoid propagating click event to body click event
    event.stopPropagation();
})

// dropdown menu hide on click outside menu wrap 
$(document).on("click", function(){
  if($("#dropDownMenuBtn:hover").length == 0){
    if($("#dropDownMenuWrap").css("opacity") == 1){
      // console.log('closing');
      $("#dropDownMenuWrap").removeClass('dropDownMenuWrapShowAnimation dropDownMenuWrapOpen').addClass('dropDownMenuWrapHideAnimation');
      // console.log('Timers: '+dropDownMenuTimers.length);
      for (var i = 0; i<dropDownMenuTimers.length; i++) {
        window.clearTimeout(dropDownMenuTimers[i]);
        // console.log('t:'+i);
      };
      dropDownMenuTimers=[];
      if($("#dropDownMenuWrap").hasClass("dropDownMenuPulsate")){
        // console.log('closing_vipr');
        $("#dropDownMenuWrap").removeClass('dropDownMenuPulsate');
      } 
      
    }
  }
});

$("#dropDownMenuWrap").on("mouseleave", function(){
    dropDownMenuTimers.push(setTimeout(function(){ 
        // console.log('timeout');
        if($("#dropDownMenuWrap").hasClass("dropDownMenuWrapShowAnimation")){
          // console.log('start vibrating');
          $("#dropDownMenuWrap").removeClass('dropDownMenuWrapOpen').addClass('dropDownMenuPulsate');
        } 


    }, 750));

    dropDownMenuTimers.push(setTimeout(function(){ 
        
        // console.log('timeout');
        if($("#dropDownMenuWrap").hasClass("dropDownMenuWrapShowAnimation")){
          // console.log('closing');
           $("#dropDownMenuWrap").removeClass('dropDownMenuWrapShowAnimation dropDownMenuPulsate dropDownMenuWrapOpen').addClass('dropDownMenuWrapHideAnimation');
        } 

    }, 1500));
})

// stop auto hide from triggering
$("#dropDownMenuWrap").on("mouseenter", function(){
    // console.log('Timers: '+dropDownMenuTimers.length);
    for (var i = 0; i<dropDownMenuTimers.length; i++) {
      window.clearTimeout(dropDownMenuTimers[i]);
      // console.log('t:'+i);
    };
    dropDownMenuTimers=[];
   if($("#dropDownMenuWrap").hasClass("dropDownMenuPulsate")){
    // console.log('stop vibrating');
    $("#dropDownMenuWrap").removeClass('dropDownMenuPulsate').addClass('dropDownMenuWrapOpen');
  } 
})

// menu click trigger teachers view render
$("#dropDownMenuLinkWrapTeacher").on("click", function(){
    getStaff();
});

// menu click trigger classroom view render
$("#dropDownMenuLinkWrapClassroom").on("click", function(){
    getClassrooms();
    // getStudents();
});


// ////////////////////////////////////////////////////////////////////////////////////////////////
// Forms
// ////////////////////////////////////////////////////////////////////////////////////////////////


// //////////////////////////////////////////////////////////////////////////////////////////////// Create student form
// Open new student panel event
$('#newStudentPanel').on('shown.bs.modal', function () {
    $('#newStudentNameInput').focus();  
});

// Reset input values when student creation form is closed
$("#newStudentPanel").on("hidden.bs.modal", function () {
    $("#newStudentPanelTitle").css("display", "block");
    var studentForm = document.getElementById("newStudentPanel").getElementsByClassName("modal-body")[0];
    studentForm.style.display = 'block';
    newStudentSubmitMsg.innerHTML = '';
    $("#newStudentNameInput").val("");
    $("#newStudentGuardianInput").val("");
    updateFormElementValidityStyle('newStudentNameInput', 'empty');
    updateFormElementValidityStyle('newStudentGuardianInput', 'empty');
    $('#newStudentNameInput').data('data-valid', false);
    $('#newStudentGuardianInput').data('data-valid', false);
    $("#newStudentCreateBtn").prop( "disabled", false );
});

// Validate student name and form submission for student creation
$("#newStudentNameInput").on("input", function(){
    if($("#newStudentNameInput").val() != ""){
      $('#newStudentNameInput').data('data-valid', true);
      updateFormElementValidityStyle('newStudentNameInput', true);
    }else{
      $('#newStudentNameInput').data('data-valid', false);
      updateFormElementValidityStyle('newStudentNameInput', 'empty');
    }
    validateNewStudentForm();
});

// Validate guardian email and form submission for student creation
$("#newStudentGuardianInput").on("input", function(){
    if($("#newStudentGuardianInput").val() != ""){
      if(validateEmail($("#newStudentGuardianInput").val())){
        $('#newStudentGuardianInput').data('data-valid', true);
        updateFormElementValidityStyle('newStudentGuardianInput', true);
      }else{
        $('#newStudentGuardianInput').data('data-valid', false);
        updateFormElementValidityStyle('newStudentGuardianInput', false, 'Not valid email');
      }

    }else{
      $('#newStudentGuardianInput').data('data-valid', false);
      updateFormElementValidityStyle('newStudentGuardianInput', 'empty');
    }
    validateNewStudentForm();
});

// Form submission for student creation
$("#newStudentCreateBtn").on("click", function(){
    createNewStudent();
});
// //////////////////////////////////////////////////////////////////////////////////////////////// end


// //////////////////////////////////////////////////////////////////////////////////////////////// Create teacher form
// Open new teacher panel event
$('#newTeacherPanel').on('shown.bs.modal', function () {
    $('#newTeacherEmailInput').focus();
});

// Close new teacher panel event
$("#newTeacherPanel").on("hidden.bs.modal", function () {
    newTeacherSubmitMsg.innerHTML = '';
    $("#newTeacherEmailInput").val("");
    updateFormElementValidityStyle('newTeacherEmailInput', 'empty');
    $('#newTeacherEmailInput').data('data-valid', false);
    $("#newTeacherEmailInput").prop( "disabled", false );
    $("#newTeacherCreateBtn").prop( "disabled", false );
});

// Typing new teacher email event
$("#newTeacherEmailInput").on("input", function(){
  if($("#newTeacherEmailInput").val() != ""){
    if(validateEmail($("#newTeacherEmailInput").val())){
      checkTeacherEmailAvailability($("#newTeacherEmailInput").val());
    }else{
      $('#newTeacherEmailInput').data('data-valid', false);
      updateFormElementValidityStyle('newTeacherEmailInput', false, 'Not valid email');
      validateNewTeacherForm();
    }
  }else{
    $('#newTeacherEmailInput').data('data-valid', false);
    updateFormElementValidityStyle('newTeacherEmailInput', 'empty');
    validateNewTeacherForm();
  }
});

// Submit new teacher event
$("#newTeacherCreateBtn").on("click", function(){
  createNewTeacher();
});
// //////////////////////////////////////////////////////////////////////////////////////////////// end


// //////////////////////////////////////////////////////////////////////////////////////////////// Create classroom form
// Open new classroom panel event
$('#newClassroomPanel').on('shown.bs.modal', function () {
    $('#newClassroomNameInput').focus();
});

// Close new classroom panel event
$("#newClassroomPanel").on("hidden.bs.modal", function () {
    newClassroomSubmitMsg.innerHTML = '';
    $("#newClassroomNameInput").val("");
    updateFormElementValidityStyle('newClassroomNameInput', 'empty');
    $('#newClassroomNameInput').data('data-valid', false);
    $("#newClassroomNameInput").prop( "disabled", false );
    $("#newClassroomCreateBtn").prop( "disabled", false );
});

// Validate classroom name and form submission for classroom creation
$("#newClassroomNameInput").on("input", function(){
  if($("#newClassroomNameInput").val() != ""){
    checkClassroomNameAvailability($("#newClassroomNameInput").val());
  }else{
    $('#newClassroomNameInput').data('data-valid', false);
    updateFormElementValidityStyle('newClassroomNameInput', 'empty');
    validateNewClassroomForm();
  }
});

// Form submission for classroom creation
$("#newClassroomCreateBtn").on("click", function(){
  createNewClassroom();
});
// //////////////////////////////////////////////////////////////////////////////////////////////// end


//when a student deletion dialog is confirmed
$("#deleteStudentBtn").on("click", function(){
  deleteStudent();
});

//when a classroom deletion dialog is confirmed
$("#deleteClassroomBtn").on("click", function(){
  deleteClassroom();
});

// create new student account option selection
$("#newStudentOptionCreateBtn").on("click", function(){
  $('#newStudentOptionsPanel').modal('toggle');
  $("#newStudentCreateBtn").css("display", "none");
  $('#newStudentPanel').modal('toggle');
});

// share classroom link option selection
$("#newStudentOptionShareBtn").on("click", function(){
  $('#newStudentOptionsPanel').modal('toggle');
  $('#newStudentShareClassroomLinkPanel').modal('toggle');
  generateClassroomLink();
});

// share classroom link copy to clipboard
$("#classroomLinkCopyBtn").on("click", function(){
  copyClassroomLinkToClipboard();
});

// accept service conditions
$("#acceptServiceConditionsBtn").on("click", function(){
  acceptServiceConditions();
});

// allow accepting service conditions if checked
$("#termsOfServiceCheckBox").on("change", function(){
  validateServiceConditionsForm();
});

// allow accepting service conditions if checked
$("#privacyPolicyCheckBox").on("change", function(){
  validateServiceConditionsForm();
});

// reopen current student info panel when closing group words progress
$("#studentGroupProgressPanel").on("hidden.bs.modal", function () {
    openStudent(currentOpenStudent);
});