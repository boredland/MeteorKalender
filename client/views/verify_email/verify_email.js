var pageSession = getDefaultPageSession();

Template.VerifyEmail.rendered = function() {
  var verifyEmailToken = Router.current().params.verifyEmailToken;
  if (verifyEmailToken) {
      Accounts.verifyEmail(verifyEmailToken, function (err) {
          if (err) {
            setErrorMessage(pageSession, err.message);
          }
      });
  }
  else {
    setErrorMessage(pageSession, err.message);
  }
	
};

Template.VerifyEmail.events({
  "click .go-home": function(e, t) {
    Router.go("/");
  }
  
});

Template.VerifyEmail.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  }
  
});
