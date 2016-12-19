var pageSession = getDefaultPageSession();

Template.Register.rendered = function() {
	pageSession.set("verificationEmailSent", false);
	Meteor.defer(function() {
		$("input[autofocus]").focus();
	});

};

Template.Register.created = function() {
	pageSession.set("errorMessage", "");
};

Template.Register.events({
	'submit #register_form' : function(e, t) {
		e.preventDefault();

		//get form data
		var submit_button = $(t.find(":submit"));
		//var register_status = t.find('#register_status').value.trim();
		var register_name = t.find('#register_name').value.trim();
		//var register_studentno = t.find('#register_studentno').value.trim();
		var register_email = t.find('#register_email').value.trim();
		var register_password = t.find('#register_password').value;
		var captchaData = grecaptcha.getResponse();


		// check name
		if(register_name == "")
		{
			pageSession.set("errorMessage", "Please enter your name.");
			t.find('#register_name').focus();
			return false;
		}
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
		Meteor.call("validateCaptcha", captchaData, function(error,result){
            grecaptcha.reset();
			if (error) {
                pageSession.set("errorMessage", "Captcha failed, please retry.");
                submit_button.button("reset");
                console.log('There was an error: ' + error.reason);
            } else {
                console.log('Success!');
                pageSession.set("errorMessage", "");
                Accounts.createUser({
                    email: register_email,
                    password: register_password,
                    profile: {name: register_name}
                }, function (err) {
                    submit_button.button("reset");
                    if (err) {
                        if (err.error === 499) {
                            pageSession.set("verificationEmailSent", true);
                        } else {
                            pageSession.set("errorMessage", err.message);
                        }
                    }
                    else {
                        pageSession.set("errorMessage", "");
                        pageSession.set("verificationEmailSent", true);
                    }
                });
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
	}
});
