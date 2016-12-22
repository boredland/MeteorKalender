var pageSession = new ReactiveDict();

Template.ForgotPassword.rendered = function() {
	nullMessages(pageSession);
	pageSession.set("resetPasswordSent", "");
	
	$("input[autofocus]").focus();
};

Template.ForgotPassword.events({
	// send reset password link
	'submit #forgot_password_form' : function(e, t) {
		e.preventDefault();

		var submit_button = $(t.find(":submit"));
		var reset_email = t.find('#reset_email').value.trim();

		// check email
		if(!isValidEmail(reset_email))
		{
			setErrorMessage(pageSession, "Please enter your e-mail address.");
			t.find('#reset_email').focus();
			return false;
		}

		submit_button.button("loading");
		Accounts.forgotPassword({email: reset_email}, function(err) {
			submit_button.button("reset");
			if (err)
				setErrorMessage(pageSession, err.message);
			else
			{
				nullMessages(pageSession);
				pageSession.set("resetPasswordSent", true);
			}
		});

		return false;
	},

	// button "OK" in information box after reset password email is sent
	'click #reset_password_sent' : function(e, t) {
		pageSession.set("resetPasswordSent", false);
		return true;
	}
	
});

Template.ForgotPassword.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	},

	resetPasswordSent: function() {
		return pageSession.get("resetPasswordSent");
	}
	
});
