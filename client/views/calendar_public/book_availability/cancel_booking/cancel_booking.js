var pageSession = getDefaultPageSession();

Template.CancelBooking.onCreated(function bodyOnCreated() {
    var cancelBookingToken = Router.current().params.cancelBookingToken;
    if (cancelBookingToken) {
        Meteor.call('booking.cancelByToken', cancelBookingToken, function (error,result) {
            if(!error){
                nullMessages(pageSession);
                setInfoMessage(pageSession, "You successfully cancelled your booking.", null);
            } else if (error && error.error === "token-expired"){
                nullMessages(pageSession);
                setErrorMessage(pageSession, error.reason, null);
            }
        });
    }
});

Template.CancelBooking.events({
    "click .go-home": function(e, t) {
        Router.go("/");
    }
});

Template.CancelBooking.helpers({
    getPageSession: function () {
        return pageSession
    }
});
