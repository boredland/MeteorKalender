var pageSession = getDefaultPageSession();

Template.VerifyBooking.onCreated(function bodyOnCreated() {
    var verifyBookingToken = Router.current().params.verifyBookingToken;
    if (verifyBookingToken) {
        Meteor.call('booking.confirm', verifyBookingToken, function (error, project) {
            if(!error){
                pageSession.set("errorMessage", "");
                pageSession.set("infoMessage", "You successfully confirmed your booking.");
            } else if (error && error.error === "confirmation-error"){
                pageSession.set("errorMessage", error.reason);
                pageSession.set("infoMessage", "");
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
    getPageSession: function () {
        return pageSession;
    }
});
