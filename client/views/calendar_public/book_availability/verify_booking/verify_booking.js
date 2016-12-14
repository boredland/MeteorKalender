var pageSession = new ReactiveDict();

Template.VerifyBooking.rendered = function() {
	pageSession.set("errorMessage", "");
    pageSession.set("errorMessage", verifyBookingToken);

    var verifyBookingToken = Router.current().params.verifyBookingToken;
  if (verifyBookingToken) {
      /*Availabilities.verifyBooking(verifyBookingToken, function (err) {
          if (err) {
            pageSession.set("errorMessage", err.message);
          }
      });*/
      pageSession.set("errorMessage", verifyBookingToken);
  }
  /*else {
    pageSession.set("errorMessage", err.message);
  }*/
	
};

Template.VerifyBooking.events({
  "click .go-home": function(e, t) {
    Router.go("/");
  }
  
});

Template.VerifyBooking.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  }
  
});
