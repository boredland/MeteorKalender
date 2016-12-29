var pageSession = getDefaultPageSession();
var finalized = 0;

Template.CancelBooking.onCreated(function bodyOnCreated() {
    var cancelBookingToken = Router.current().params.cancelBookingToken;
    if (cancelBookingToken) {
        Meteor.call('booking.cancelByToken', cancelBookingToken, function (error, project) {
            if(!error && finalized === 0){
                finalized = 1;
                nullMessages(pageSession);
                setInfoMessage(pageSession, "You successfully cancelled your booking.", null);
                console.log("cancelsuccess");
            } else if (error && error.error === "cancellation-error" && finalized === 0){
                finalized = 1;
                nullMessages(pageSession);
                setErrorMessage(pageSession, error.reason, null);
                console.log("cancelerror");
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
