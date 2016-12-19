var pageSession = new ReactiveDict();
var finalized = 0;

Template.CancelBooking.onCreated(function bodyOnCreated() {
    var cancelBookingToken = Router.current().params.cancelBookingToken;
    if (cancelBookingToken) {
        Meteor.call('booking.cancelByToken', cancelBookingToken, function (error, project) {
            if(!error && finalized === 0){
                finalized = 1;
                pageSession.set("errorMessage", "");
                pageSession.set("infoMessage", "You successfully cancelled your booking.");
                console.log("cancelsuccess");
            } else if (error && error.error === "cancellation-error" && finalized === 0){
                finalized = 1;
                pageSession.set("errorMessage", error.reason);
                pageSession.set("infoMessage", "");
                console.log("cancelerror");
            }
        });
    }
});

Template.CancelBooking.rendered = function() {

};

Template.CancelBooking.events({
    "click .go-home": function(e, t) {
        Router.go("/");
    }

});

Template.CancelBooking.helpers({
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    },
    "infoMessage": function() {
        return pageSession.get("infoMessage");
    }

});
