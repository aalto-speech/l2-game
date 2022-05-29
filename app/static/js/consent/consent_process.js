// var url_string = window.location.href;
// var url = new URL(url_string);
// var hash = url.searchParams.get("id");
// var chosen_language = url.searchParams.get("lang");
var hash = document.URL.replace(/.*id=([^&]*).*|(.*)/, '$1');
var chosen_language = document.URL.replace(/.*lang=([^&]*).*|(.*)/, '$1');
// add check if lang exists i url else English
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
	getConsentStatus(hash);
});

$("#languageButton").on("click", function(){
	$('#languagePanel').modal('toggle');
	loadLanguages();
});

$("#giveConsentBtn").on("click", function(){
	giveConsent(hash);
});

$("#revokeConsentBtn").on("click", function(){
	revokeConsent(hash);
});

function loadLanguages(){
	languagePanelContent.innerHTML = '';
	languagePanelTitle.innerHTML = consent_page_translations[chosen_language]['language_panel_title'];
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
	giveConsentBtn.innerHTML = consent_page_translations[chosen_language]['give_consent_button_label'];
	revokeConsentBtn.innerHTML = consent_page_translations[chosen_language]['revoke_consent_button_label'];
	msgRef = consentStatus.getAttribute('msg-name');
	console.log(msgRef);
	if(msgRef != ''){
		consentStatus.innerHTML = '"'+consent_page_translations[chosen_language][msgRef]+'"'
	}
}

function getConsentStatus(hash){
	$.ajax({
		type: "POST",
		url: "/getConsentStatus/"+hash,
		statusCode: {
		    200: function(response) {
				console.log(response);
			  	if(response){
			  		revokeConsentBtn.style.backgroundColor ="white";
			  		revokeConsentBtn.style.color ="#f996bb";
			  		giveConsentBtn.style.backgroundColor ="#f996bb";
			  		giveConsentBtn.style.color ="white";
			  		consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['give_consent_message']+'"';
			  		consentStatus.setAttribute('msg-name', 'give_consent_message');
			  	}else{
			  		revokeConsentBtn.style.backgroundColor ="#f996bb";
			  		revokeConsentBtn.style.color ="white";
			  		giveConsentBtn.style.backgroundColor ="white";
			  		giveConsentBtn.style.color ="#f996bb";
			  		consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['revoke_consent_message']+'"';
			  		consentStatus.setAttribute('msg-name', 'revoke_consent_message');

			  	}
		    },
		    404: function(response) {
		    	revokeConsentBtn.style.display = 'none';
			  	giveConsentBtn.style.display = 'none';
		    	consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['corrupt_hash_id_message']+'"';
		    	consentStatus.setAttribute('msg-name', 'corrupt_hash_id_message');
		    }
		},  
		dataType: "json"
	});							
}

function giveConsent(hash){
	$.ajax({
	  type: "POST",
	  url: "/giveConsent/"+hash,
	  statusCode: {
		    200: function(response) {
			  	console.log(response);
		  		revokeConsentBtn.style.backgroundColor ="white";
		  		revokeConsentBtn.style.color ="#f996bb";
		  		giveConsentBtn.style.backgroundColor ="#f996bb";
		  		giveConsentBtn.style.color ="white";
		  		consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['give_consent_message']+'"';
		  		consentStatus.setAttribute('msg-name', 'give_consent_message');
	  		},
	  		404: function(response) {
		    	revokeConsentBtn.style.display = 'none';
			  	giveConsentBtn.style.display = 'none';
		    	consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['corrupt_hash_id_message']+'"';
		    	consentStatus.setAttribute('msg-name', 'corrupt_hash_id_message');
		    }
	  },
	  dataType: "json"
	});							
}

function revokeConsent(hash){
	$.ajax({
	  type: "POST",
	  url: "/revokeConsent/"+hash,
	  statusCode: {
		    200: function(response) {
			  	console.log(response);
		  		revokeConsentBtn.style.backgroundColor ="#f996bb";
		  		revokeConsentBtn.style.color ="white";
		  		giveConsentBtn.style.backgroundColor ="white";
		  		giveConsentBtn.style.color ="#f996bb";
		  		consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['revoke_consent_message']+'"';
		  		consentStatus.setAttribute('msg-name', 'revoke_consent_message');
	  		},
	  		404: function(response) {
		    	revokeConsentBtn.style.display = 'none';
			  	giveConsentBtn.style.display = 'none';
		    	consentStatus.innerHTML = '"'+consent_page_translations[chosen_language]['corrupt_hash_id_message']+'"';
		    	consentStatus.setAttribute('msg-name', 'corrupt_hash_id_message');
		    }
	  },
	  dataType: "json"
	});							
}
