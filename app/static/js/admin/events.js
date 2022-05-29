// When document/page loads get data from server
$(document).ready(function() {
  getSessionInfo();
  getAdmins();
  getDistributors();
  getSchools();
  getNotifications();
  getDirectors();
  getTeachers();
  getConsumers();
});

// When form for admin creation opens set focus on input field
$('#newAdminPanel').on('shown.bs.modal', function () {
    emailValid = false;
    $('#newAdminEmailInput').focus();
});

// When form for distributor creation opens set focus on input field
$('#newDistributorPanel').on('shown.bs.modal', function () {
    emailValid = false;
    $('#newDistributorEmailInput').focus();
});

// When form for school creation opens set focus on input field
$('#newSchoolPanel').on('shown.bs.modal', function () {
    schoolValid = false;
    languageValid = false;
    $('#newSchoolInput').focus();
});

// When form for director creation opens set focus on input field
$('#newDirectorPanel').on('shown.bs.modal', function () {
    schoolValid = false;
    emailValid = false;
    $('#newDirectorEmailInput').focus();
});

// When form for teacher creation opens set focus on input field
$('#newTeacherPanel').on('shown.bs.modal', function () {
    schoolValid = false;
    emailValid = false;
    $('#newTeacherEmailInput').focus();
});

// Reset input values when admin creation form is closed
$("#newAdminPanel").on("hidden.bs.modal", function () {
    emailValid = false;
    $("#newAdminEmailInput").val("");
});

// Reset input values when distributor creation form is closed
$("#newDistributorPanel").on("hidden.bs.modal", function () {
    emailValid = false;
    $("#newDistributorEmailInput").val("");
});

// Reset input values when director creation form is closed
$("#newDirectorPanel").on("hidden.bs.modal", function () {
    schoolValid = false;
    emailValid = false;
    $("#newDirectorEmailInput").val("");
});

// Reset input values when teacher creation form is closed
$("#newTeacherPanel").on("hidden.bs.modal", function () {
    schoolValid = false;
    emailValid = false;
    $("#newTeacherEmailInput").val("");
});

// Reset input values when school creation form is closed
$("#newSchoolPanel").on("hidden.bs.modal", function () {
    schoolValid = false;
    languageValid = false;
    dateValid = false;
    classroomLimitValid = false;
    studentLimitValid = false;
    $('#newSchoolInputSubscriptionEndDate').datepicker('clearDates');
    $("#newSchoolInput").val("");
    $("#newSchoolInputClassroomLimit").val("");
    $("#newSchoolInputStudentLimit").val("");
});

// Reset input values when school edition form is closed
$("#editSchoolPanel").on("hidden.bs.modal", function () {
    schoolValid = false;
});

// When form for school edit opens 
$('#editSchoolPanel').on('shown.bs.modal', function () {
    schoolValid = true;
    studentLimitValid = true;
    classroomLimitValid = true;
});

// Reset input values when notification creation form is closed
$("#newNotificationPanel").on("hidden.bs.modal", function () {
    notificationValid = false;
    languageValid = false;
    textValid = false;
    htmlValid = false;
    $("#newNotificationTextContentInput").val("");
    $("#newNotificationHtmlContentInput").val("");
});

// Reset input values when multi school creation form is closed
$("#newSchoolTeacherMultiPanel").on("hidden.bs.modal", function () {
    dateValid = false;
    sortedSchoolsDiv.innerHTML = "";
    sortedTeachersDiv.innerHTML = "";
    sortedLanguageDiv.innerHTML = "";
    $('#newSchoolMultiInputSubscriptionEndDate').datepicker('clearDates');
    $("#schoolTeacherMultiInput").val("");
});

// Reset input values when consumer creation form is closed
$("#newConsumerPanel").on("hidden.bs.modal", function () {
  $("#consumersInput").val("");
  $("#newConsumerCreateBtn").css("display", "none");
  newConsumerSubmitMsg.innerHTML = "";
});

// Admin user creation modal form opens
$("#addAdminBtn").on("click", function(){
    $("#newAdminCreateBtn").css("display", "none");
    $('#newAdminPanel').modal('toggle');
});

// Distributor user creation modal form opens
$("#addDistributorBtn").on("click", function(){
    $("#newDistributorCreateBtn").css("display", "none");
    $('#newDistributorPanel').modal('toggle');
});

// School entry creation modal form opens
$("#addSchoolBtn").on("click", function(){
  populateLanguageSelection(newSchoolLanguageInput)
	$("#newSchoolCreateBtn").css("display", "none");
  	$('#newSchoolPanel').modal('toggle');
});

// Notifications entry creation modal form opens
$("#addNotificationBtn").on("click", function(){
  populateNotificationSelection(newNotificationInput)
  populateLanguageSelection(newNotificationLanguageInput)
  $("#newNotificationCreateBtn").css("display", "none");
    $('#newNotificationPanel').modal('toggle');
});

// Director user creation modal form opens
$("#addDirectorBtn").on("click", function(){
  populateSchoolSelection(newDirectorSchoolInput);
  $("#newDirectorCreateBtn").css("display", "none");
    $('#newDirectorPanel').modal('toggle');
});

// Teacher user creation modal form opens
$("#addTeacherBtn").on("click", function(){
  populateSchoolSelection(newTeacherSchoolInput);
  $("#newTeacherCreateBtn").css("display", "none");
    $('#newTeacherPanel').modal('toggle');
});

// Consumer user creation modal form opens
$("#addConsumerBtn").on("click", function(){
  $("#newConsumerCreateBtn").css("display", "none");
    $('#newConsumerPanel').modal('toggle');
});

// Form submission for admin deletion
$("#deleteAdminBtn").on("click", function(){
  deleteAdmin();
});

// Form submission for admin deletion
$("#deleteDistributorBtn").on("click", function(){
  deleteDistributor();
});

// Form submission for director deletion
$("#deleteDirectorBtn").on("click", function(){
  deleteDirector();
});

// Form submission for teacher deletion
$("#deleteTeacherBtn").on("click", function(){
  deleteTeacher();
});

// Form submission for school deletion
$("#deleteSchoolBtn").on("click", function(){
  deleteSchool();
});

// Form submission for consumer deletion
$("#deleteConsumerBtn").on("click", function(){
  deleteConsumer();
});

// Form submission for notification deletion
$("#deleteNotificationBtn").on("click", function(){
  deleteNotification();
});

// Form submission for admin creation
$("#newAdminCreateBtn").on("click", function(){
  createNewAdmin();
});
// Form submission for distributor creation
$("#newDistributorCreateBtn").on("click", function(){
  createNewDistributor();
});
// Form submission for school creation
$("#newSchoolCreateBtn").on("click", function(){
	createNewSchool();
});
// Form submission for school update
$("#editSchoolUpdateBtn").on("click", function(){
  updateSchool();
});
// Form submission for notification creation
$("#newNotificationCreateBtn").on("click", function(){
  createNewNotification();
});

// Form submission for director creation
$("#newDirectorCreateBtn").on("click", function(){
	createNewDirector();
});

// Form submission for teacher creation
$("#newTeacherCreateBtn").on("click", function(){
  createNewTeacher();
});

// Form submission for consumer creation
$("#newConsumerCreateBtn").on("click", function(){
  createNewConsumer();
});

// Validate username and form submission for admin creation
$("#newAdminEmailInput").on("input", function(){
  if($("#newAdminEmailInput").val() != ""){
	  checkEmailAvailability($("#newAdminEmailInput").val());
  }else{
  	emailValid = false;
  	validateNewAdminFrom();
  }
});

// Validate username and form submission for distributor creation
$("#newDistributorEmailInput").on("input", function(){
  if($("#newDistributorEmailInput").val() != ""){
    checkDistributorAvailability($("#newDistributorEmailInput").val());
  }else{
    emailValid = false;
    validateNewDistributorFrom();
  }
});

// ________________________________________________________________________________________________________________
// Validate school name and form submission for school creation
$("#newSchoolInput").on("input", function(){
  if($("#newSchoolInput").val() != ""){
	  checkSchoolAvailabilityNewSchool($("#newSchoolInput").val());
  }else{
    schoolValid = false;
    validateNewSchoolForm();
  }
});

// Validate school language and form submission for school creation
$("#newSchoolLanguageInput").on("input", function(){
  if($("#newSchoolLanguageInput").val() != null){
    languageValid = true;
  }else{
    languageValid = false;
  }
  validateNewSchoolForm();
});

// init and Validate school newSchoolInputSubscriptionEndDate and form submission for school creation
$('#newSchoolInputSubscriptionEndDate').datepicker({
  format: 'yyyy-mm-dd'
}).on('change', function(){
    if($("#newSchoolInputSubscriptionEndDate").val() != ""){
      dateValid = true;
    }
    validateNewSchoolForm();
  });

// Validate school classroom limit and form submission for school creation
$("#newSchoolInputClassroomLimit").on("input", function(){
  if($("#newSchoolInputClassroomLimit").val() != '' && $("#newSchoolInputClassroomLimit").val()>=0){
    classroomLimitValid = true;
  }else{
    classroomLimitValid = false;
  }
  validateNewSchoolForm();
});

// Validate school student limit and form submission for school creation
$("#newSchoolInputStudentLimit").on("input", function(){
  if($("#newSchoolInputStudentLimit").val() != '' && $("#newSchoolInputStudentLimit").val()>=0){
    studentLimitValid = true;
  }else{
    studentLimitValid = false;
  }
  validateNewSchoolForm();
});

// ________________________________________________________________________________________________________________
// validate editSchoolNameInput on school edit form
$("#editSchoolNameInput").on("input", function(){
  if($("#editSchoolNameInput").val() != ""){
    checkSchoolAvailabilityEditSchool($("#editSchoolNameInput").val());
  }else{
    schoolValid = false;
    validateEditSchoolForm();
  }
});


// Validate school classroom limit and form submission for school edition
$("#editSchoolClassroomLimit").on("input", function(){
  if($("#editSchoolClassroomLimit").val() != '' && $("#editSchoolClassroomLimit").val()>=0){
    classroomLimitValid = true;
  }else{
    classroomLimitValid = false;
  }
  validateEditSchoolForm();
});

// Validate school student limit and form submission for school edition
$("#editSchoolStudentLimit").on("input", function(){
  if($("#editSchoolStudentLimit").val() != '' && $("#editSchoolStudentLimit").val()>=0){
    studentLimitValid = true;
  }else{
    studentLimitValid = false;
  }
  validateEditSchoolForm();
});

// ________________________________________________________________________________________________________________
// init datepicker on school multi JSON creation form
$('#newSchoolMultiInputSubscriptionEndDate').datepicker({
  format: 'yyyy-mm-dd'
}).on('change', function(){
    if($("#newSchoolMultiInputSubscriptionEndDate").val() != ""){
      dateValid = true;
    }
    validateNewSchoolMultiForm();
  });

// Validate directors name and form submission for directors creation
$("#newDirectorEmailInput").on("input", function(){
  if($("#newDirectorEmailInput").val() != ""){
	  checkDirectorAvailability($("#newDirectorEmailInput").val());
  }else{
  	emailValid = false;
  	validateNewDirectorFrom();
  }
});

// Validate school and form submission for director creation
$("#newDirectorSchoolInput").on("input", function(){
  if($("#newDirectorSchoolInput").val() != null){
	 schoolValid = true;
  }else{
  	schoolValid = false;	
  }
  validateNewDirectorFrom();
});

// Validate teachers name and form submission for teachers creation
$("#newTeacherEmailInput").on("input", function(){
  if($("#newTeacherEmailInput").val() != ""){
    checkTeacherAvailability($("#newTeacherEmailInput").val());
  }else{
    emailValid = false;
    validateNewTeacherFrom();
  }
});

// Validate school and form submission for teacher creation
$("#newTeacherSchoolInput").on("input", function(){
  if($("#newTeacherSchoolInput").val() != null){
    schoolValid = true;
  }else{
    schoolValid = false;  
  }
  validateNewTeacherFrom();
});

// Validate notification and form submission for notification creation
$("#newNotificationInput").on("input", function(){
  if($("#newNotificationInput").val() != null){
    notificationValid = true;
  }else{
    notificationValid = false;  
  }
  validateNewNotificationFrom();
});

// Validate language and form submission for notification creation
$("#newNotificationLanguageInput").on("input", function(){
  if($("#newNotificationLanguageInput").val() != null){
    languageValid = true;
  }else{
    languageValid = false;  
  }
  validateNewNotificationFrom();
});

// Validate textContent and form submission for notification creation
$("#newNotificationTextContentInput").on("input", function(){
  if($("#newNotificationTextContentInput").val() != ""){
    textValid = true;
  }else{
    textValid = false;  
  }
  validateNewNotificationFrom();
});

// Validate textContent and form submission for notification creation
$("#newNotificationHtmlContentInput").on("input", function(){
  if($("#newNotificationHtmlContentInput").val() != ""){
    htmlValid = true;
  }else{
    htmlValid = false;  
  }
  validateNewNotificationFrom();
});

// open school & teacher multi insert panel
$("#addSchoolTeacherMultiBtn").on("click", function(){
  $("#newSchoolTeacherMultiCreateBtn").css("display", "none");
  $("#newSchoolTeacherMultiCreateBtn").prop("disabled",false);
  $('#newSchoolTeacherMultiPanel').modal('toggle');
});

// prepare and sort data on input of multi school teacher JSON
$("#schoolTeacherMultiInput").on("input", function(){
  sortSchoolTeacherJSONData();
});

// validate JSON data for consumer form
$("#consumersInput").on("input", function(){
  validateConsumerJSONData();
});

// submitt schoolTeacherMultiForm
// open school & teacher multi insert panel
$("#newSchoolTeacherMultiCreateBtn").on("click", function(){
  createMultipleSchoolsAndTeachers();
});

//open service conditions panel
$("#serviceConditionsBtn").on("click", function(){
  $('#serviceConditionsPanel').modal('toggle');
  populateServiceConditionsForm();
});

// save service conditions 
$("#serviceConditionsCreateBtn").on("click", function(){
  updateServiceConditions();
});


// //////////////////////////////////////////////////////////////////////////////////////////////// Create test students form

// Form opens event
$('#newTestStudentPanel').on('shown.bs.modal', function () {
    $("#newTestStudentNameInput").prop( "disabled", true );
});

// Test students user creation modal form opens
$("#addTestStudentBtn").on("click", function(){
  populateSchoolSelection(newTestStudentSchoolInput);
  $("#newTestStudentCreateBtn").css("display", "none");
    $('#newTestStudentPanel').modal('toggle');
});
// Reset input values when testStudents creation form is closed
$("#newTestStudentPanel").on("hidden.bs.modal", function () {
  $('#newTestStudentSchoolInput').data('data-valid', false);
  $('#newTestStudentGuardianInput').data('data-valid', false);
  $('#newTestStudentNumberAccountsInput').data('data-valid', false);
  $('#newTestStudentNumberClassroomsInput').data('data-valid', false);
  $('#newTestStudentNameInput').data('data-valid', false);

  updateFormElementValidityStyle('newTestStudentSchoolInput', 'empty');
  updateFormElementValidityStyle('newTestStudentGuardianInput', 'empty');
  updateFormElementValidityStyle('newTestStudentNumberAccountsInput', 'empty');
  updateFormElementValidityStyle('newTestStudentNumberClassroomsInput', 'empty');
  updateFormElementValidityStyle('newTestStudentNameInput', 'empty');

  $('#newTestStudentSchoolInput').val('');
  $('#newTestStudentGuardianInput').val('');
  $('#newTestStudentNumberAccountsInput').val('');
  $('#newTestStudentNumberClassroomsInput').val('');
  $('#newTestStudentNameInput').val('');

});

// Select school event
$("#newTestStudentSchoolInput").on("input", function(){
  if($("#newTestStudentSchoolInput").val() != null){
    $("#newTestStudentSchoolInput").data('data-valid', true);
    updateFormElementValidityStyle('newTestStudentSchoolInput', true);
  }else{
    $("#newTestStudentSchoolInput").data('data-valid', false);
    updateFormElementValidityStyle('newTestStudentSchoolInput', 'empty');
  }
  validateNewTestStudentsForm();
});

// Select guardian event
$("#newTestStudentGuardianInput").on("input", function(){
  if($("#newTestStudentGuardianInput").val() != ''){
    if(validateEmail($("#newTestStudentGuardianInput").val())){
      //valid
      $("#newTestStudentGuardianInput").data('data-valid', true);
       updateFormElementValidityStyle('newTestStudentGuardianInput', true);
    }else{
      //invalid
      $("#newTestStudentGuardianInput").data('data-valid', false);
       updateFormElementValidityStyle('newTestStudentGuardianInput', false, 'Not valid email');
    }
  }else{
    //empty
    $("#newTestStudentGuardianInput").data('data-valid', false);
    updateFormElementValidityStyle('newTestStudentGuardianInput', 'empty');
  }
  validateNewTestStudentsForm();
});

// Select number accounts event
$("#newTestStudentNumberAccountsInput").on("input", function(){
  if(parseInt($("#newTestStudentNumberAccountsInput").val()) > 0){
    $("#newTestStudentNumberAccountsInput").data('data-valid', true);
    updateFormElementValidityStyle('newTestStudentNumberAccountsInput', true);
    $("#newTestStudentNameInput").trigger("input");
    $("#newTestStudentNameInput").prop( "disabled", false );
  }else{
    $("#newTestStudentNumberAccountsInput").val('');
    $("#newTestStudentNumberAccountsInput").data('data-valid', false);
    updateFormElementValidityStyle('newTestStudentNumberAccountsInput', 'empty');
    $("#newTestStudentNameInput").trigger("input");
    $("#newTestStudentNameInput").prop( "disabled", true );
  }
  validateNewTestStudentsForm();
});

// Select number classrooms event
$("#newTestStudentNumberClassroomsInput").on("input", function(){
  if(parseInt($("#newTestStudentNumberClassroomsInput").val()) > 0){
    $("#newTestStudentNumberClassroomsInput").data('data-valid', true);
    updateFormElementValidityStyle('newTestStudentNumberClassroomsInput', true);
  }else{
    $("#newTestStudentNumberClassroomsInput").val('');
    $("#newTestStudentNumberClassroomsInput").data('data-valid', false);
    updateFormElementValidityStyle('newTestStudentNumberClassroomsInput', 'empty');
  }
  validateNewTestStudentsForm();
});

// Select students name event
$("#newTestStudentNameInput").on("input", function(){
  if($("#newTestStudentNameInput").val() != '' && $("#newTestStudentNameInput").val() != ' '){
    if($("#newTestStudentNumberAccountsInput").val().length){
      var testUsername = $("#newTestStudentNameInput").val().replace(/\s/g, '');
      checkTestStudentUsernameAvailability( testUsername, $("#newTestStudentNumberAccountsInput").val());
    }else{
      $("#newTestStudentNameInput").data('data-valid', false);
      updateFormElementValidityStyle('newTestStudentNameInput', false, 'Set number of accounts');
    }
  }else{
    $("#newTestStudentNameInput").val('');
    $("#newTestStudentNameInput").data('data-valid', false);
    updateFormElementValidityStyle('newTestStudentNameInput', 'empty');
  }
  validateNewTestStudentsForm();
});

// Submit test student creation form
$("#newTestStudentCreateBtn").on("click", function(){
  createNewTestStudentAccounts();
});
// //////////////////////////////////////////////////////////////////////////////////////////////// end