var pageSession = new ReactiveDict();

Template.VerifyBooking.rendered = function() {
	pageSession.set("errorMessage", "");
    pageSession.set("infoMessage", "");
    var verifyBookingToken = Router.current().params.verifyBookingToken;
    if (verifyBookingToken) {
      Meteor.call('booking.confirm', verifyBookingToken, function (error, project) {
          if (error && error.error == "confirmation-error"){
              pageSession.set("errorMessage", error.reason);
              pageSession.set("infoMessage", "");
          } else {
              pageSession.set("errorMessage", "");
              pageSession.set("infoMessage", "You successfully confirmed your booking.");
          }
      });
    }
};

Template.VerifyBooking.events({
  "click .go-home": function(e, t) {
    Router.go("/");
  }
  
});

Template.VerifyBooking.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  },
  "infoMessage": function() {
    return pageSession.get("infoMessage");
  }
  
});
