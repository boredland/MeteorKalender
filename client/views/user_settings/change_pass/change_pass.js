var pageSession = getDefaultPageSession();

Template.UserSettingsChangePass.rendered = function() {
	$("input[autofocus]").focus();
};

Template.UserSettingsChangePass.events({
	'submit #change_pass_form' : function(e, t) {
		e.preventDefault();

		setErrorMessage(pageSession, "");
		setInfoMessage(pageSession, "");

		var submit_button = $(t.find(":submit"));

		var old_password = t.find('#old_password').value;
		var new_password = t.find('#new_password').value;
		var confirm_pass = t.find('#confirm_pass').value;

		if(old_password === "")
		{
			setErrorMessage(pageSession, "Please enter your old password.");
			t.find('#old_password').focus();
			return false;
		}
		if(new_password === "")
		{
			setErrorMessage(pageSession, "Please enter your new password.");
			t.find('#new_password').focus();
			return false;
		}
		if(confirm_pass === "")
		{
			setErrorMessage(pageSession, "Please confirm your new password.");
			t.find('#confirm_pass').focus();
			return false;
		}

		// check new password
		if(new_password !== confirm_pass)
		{
			setErrorMessage(pageSession, "Your new password and confirm password doesn't match.");
			t.find('#new_password').focus();
			return false;
		}

		submit_button.button("loading");
		Accounts.changePassword(old_password, new_password, function(err) {
			submit_button.button("reset");
			if (err) {
				setErrorMessage(pageSession, err.message);
				return false;
			} else {
				setErrorMessage(pageSession, "");
				setInfoMessage(pageSession, "Your new password is set.");
				t.find('#old_password').value = "";
				t.find('#new_password').value = "";
				t.find('#confirm_pass').value = "";
				t.find('#old_password').focus();
			}
		});
		return false; 
	}
	
});

Template.UserSettingsChangePass.helpers({
	errorMessage: function() {
		return pageSession.get("errorMessage");
	},
	infoMessage: function() {
		return pageSession.get("infoMessage");
	}
	
});
