var pageSession = getDefaultPageSession();


Template.VerifyResend.rendered = function() {
	
	$("input[autofocus]").focus();
};
/*
Template.Login.events({
	"submit #login_form": function(e, t) {
		e.preventDefault();
		nullMessages(pageSession);

		var submit_button = $(t.find(":submit"));

		var login_email = t.find('#login_email').value.trim();

        // check email
        if(!isValidEmail(register_email))
        {
            setErrorMessage(pageSession, "Please enter valid e-mail address that ends with .fra-uas.de, .frankfurt-unversity.de or fh-frankfurt.de.");
            t.find('#register_email').focus();
            return false;
        }

        submit_button.button("loading");
        Accounts.sendVerificationEmail(_userId,"login_email");

	},
});

Template.Login.helpers({
    getPageSession: function () {
        return pageSession;
    },

    verificationEmailSent: function() {
        return pageSession.get("verificationEmailSent");
    }
	
});
*/