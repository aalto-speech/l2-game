var id = "";
var password1Valid = false;
var password2Valid = false;
var passwordStrength = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

$(document).ready(function() {
	$("#registerBtn").css("display", "none");
	// var url_string = window.location.href;
	// var url = new URL(url_string);
	// id = url.searchParams.get("id");
	id = document.URL.replace(/.*id=([^&]*).*|(.*)/, '$1');
	getEmail(id);
});

$("#password1").on("input", function(){
	$("#password1").val($("#password1").val().replace(/\s/g, ''));
	if($("#password1").val() != ''){
		if(passwordStrength.test($("#password1").val())){
			password1Valid = true;
			updateFormElementValidityStyle('password1', true);
		}else{
			password1Valid = false;
			updateFormElementValidityStyle('password1', false, 'Not strong enough');
		}
	}else{
		password1Valid = false;
		updateFormElementValidityStyle('password1', 'empty');
	}
	$("#password2").trigger("input");
});

$("#password2").on("input", function(){
	if($("#password2").val() != ''){
		if($("#password1").val() == $("#password2").val()){
			password2Valid = true;
			updateFormElementValidityStyle('password2', true);
		}else{
			password2Valid = false;
			updateFormElementValidityStyle('password2', false, 'Password has to match');
		}
	}else{
		password2Valid = false;
		updateFormElementValidityStyle('password2', 'empty');
	}
	validatePasswordForm();
});

$("#password1").on("mouseleave", function(){
	$(this).prop('type', 'password');
})


$("#password1").on("mouseenter", function(){
	$(this).prop('type', 'text');
})

$("#password2").on("mouseleave", function(){
	$(this).prop('type', 'password');
})


$("#password2").on("mouseenter", function(){
	$(this).prop('type', 'text');
})

function validatePasswordForm(){
	if(password1Valid && password2Valid){
	  $("#registerBtn").css("display", "block");
	}else{
		$("#registerBtn").css("display", "none");
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

function getEmail(idhash){
	$.ajax({
	  type: "POST",
	  url: "/getUserEmail/"+idhash,
	  success: function (response) { 
	  	console.log(response);
	  	if(response.length){
	  		var emailInput = document.getElementById('emailInput');
	  		emailInput.value = response[0].email;
	  		var hashInput = document.getElementById('hashInput');
	  		hashInput.value = id;
	  	}else{
	  		$("#setPasswordForm").css("display", "none");
	  		var responseMessage = document.getElementById('responseMessage');
	  		responseMessage.innerHTML = '"This link seams to be expired or broken"';
	  	}
	  	
	  },
	  dataType: "json"
	});							
};
