var pageSession = new ReactiveDict();

Template.Register.rendered = function() {
	pageSession.set("errorMessage", "");
	pageSession.set("verificationEmailSent", false);
    //pageSession.set("isStudent", true);
	Meteor.defer(function() {
		$("input[autofocus]").focus();
	});

};

Template.Register.created = function() {
	pageSession.set("errorMessage", "");
};

Template.Register.events({
    /*"change #register_status": function(event, template){
        var selectValue = template.$("#register_status").val();
        if (selectValue === 'professor'){
            pageSession.set("isStudent", false);
        }
        else if (selectValue === 'student'){
            pageSession.set("isStudent", true);
        }
    },*/
	'submit #register_form' : function(e, t) {
		e.preventDefault();

		var submit_button = $(t.find(":submit"));
		//var register_status = t.find('#register_status').value.trim();
		var register_name = t.find('#register_name').value.trim();
		//var register_studentno = t.find('#register_studentno').value.trim();
		var register_email = t.find('#register_email').value.trim();
		var register_password = t.find('#register_password').value;
		// check name
		if(register_name == "")
		{
			pageSession.set("errorMessage", "Please enter your name.");
			t.find('#register_name').focus();
			return false;
		}
		// check student number
		/*if(register_studentno == "")
		{
			pageSession.set("errorMessage", "Please enter your student number.");
			t.find('#register_studentno').focus();
			return false;
		}*/
		// check email
		if(!isValidEmail(register_email))
		{
			pageSession.set("errorMessage", "Please enter valid e-mail address that ends with .fra-uas.de, .frankfurt-unversity.de or fh-frankfurt.de.");
			t.find('#register_email').focus();
			return false;
		}

		// check password
		var min_password_len = 6;
		if(!isValidPassword(register_password, min_password_len))
		{
			pageSession.set("errorMessage", "Your password must be at least " + min_password_len + " characters long.");
			t.find('#register_password').focus();
			return false;
		}

		submit_button.button("loading");
		//, status: register_status, studentno: register_studentno
		//Meteor.call()
		Accounts.createUser({email: register_email, password : register_password, profile: { name: register_name }}, function(err) {
			submit_button.button("reset");
			if(err) {
				if(err.error === 499) {
					pageSession.set("verificationEmailSent", true);
				} else {
					pageSession.set("errorMessage", err.message);
				}
			}
			else
			{
				pageSession.set("errorMessage", "");
				pageSession.set("verificationEmailSent", true);
			}
		});
		return false;
	},

	"click .go-home": function(e, t) {
		Router.go("/");
	}
});

Template.Register.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	},
	verificationEmailSent: function() {
		return pageSession.get("verificationEmailSent");
	}/*,
    isStudent: function() {
        //return
        return pageSession.get("isStudent");
    }*/
});
