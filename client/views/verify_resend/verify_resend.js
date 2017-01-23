var pageSession = getDefaultPageSession();

Template.VerifyResend.rendered = function() {
	
	$("input[autofocus]").focus();
};

Template.VerifyResend.events({
	"submit #verify_form": function(e, t) {
		e.preventDefault();
		nullMessages(pageSession);

		var submit_button = $(t.find(":submit"));

		var verify_email = t.find('#verify_email').value.trim();

        var verifyEmailToken = Router.current().params.verifyEmailToken;

        // check email
        if(!isValidEmail(verify_email))
        {
            setErrorMessage(pageSession, "Please enter valid e-mail address that ends with .fra-uas.de, .frankfurt-unversity.de or fh-frankfurt.de.");
            t.find('#verify_email').focus();
            return false;
        }

        submit_button.button("loading");
        Accounts.verifyEmail(verifyEmailToken, function (err) {
            if (err) {
                setErrorMessage(pageSession, err.message, null);
            }
        });
        Accounts.sendVerificationEmail(_userId,"verify_email");

	},

    "click .go-home": function(e, t) {
        Router.go("/");
    }
});

Template.VerifyResend.helpers({
    getPageSession: function () {
        return pageSession;
    },

    verificationEmailSent: function() {
        return pageSession.get("verificationEmailSent");
    }
	
});
