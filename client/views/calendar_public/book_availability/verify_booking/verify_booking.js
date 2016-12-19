var pageSession = getDefaultPageSession();
var finalized = 0;

Template.VerifyBooking.onCreated(function bodyOnCreated() {
    var verifyBookingToken = Router.current().params.verifyBookingToken;
    if (verifyBookingToken) {
        Meteor.call('booking.confirm', verifyBookingToken, function (error, project) {
            if(!error && finalized === 0){
                finalized = 1;
                pageSession.set("errorMessage", "");
                pageSession.set("infoMessage", "You successfully confirmed your booking.");
                console.log("confirmsuccess");
            } else if (error && error.error === "confirmation-error" && finalized === 0){
                finalized = 1;
                pageSession.set("errorMessage", error.reason);
                pageSession.set("infoMessage", "");
                console.log("confirmerror");
            }
        });
    }
});

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
