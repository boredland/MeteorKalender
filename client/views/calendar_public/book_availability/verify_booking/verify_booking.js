var pageSession = getDefaultPageSession();

Template.VerifyBooking.onCreated(function bodyOnCreated() {
    var verifyBookingToken = Router.current().params.verifyBookingToken;
    if (verifyBookingToken) {
        Meteor.call('booking.confirm', verifyBookingToken, function (error, project) {
            if(!error){
                nullMessages(pageSession);
                setInfoMessage(pageSession, "You successfully confirmed your booking.", null);
            } else if (error && error.error === "confirmation-error"){
                nullMessages(pageSession);
                setErrorMessage(pageSession, error.reason, null);
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
