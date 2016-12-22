var pageSession = getDefaultPageSession();

Template.VerifyBooking.onCreated(function bodyOnCreated() {
    var verifyBookingToken = Router.current().params.verifyBookingToken;
    if (verifyBookingToken) {
        Meteor.call('booking.confirm', verifyBookingToken, function (error, project) {
            if(!error){
                nullMessages(pageSession);
                setInfoMessage(pageSession, "You successfully confirmed your booking.");
            } else if (error && error.error === "confirmation-error"){
                setErrorMessage(pageSession, error.reason);
                nullMessages(pageSession);
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
