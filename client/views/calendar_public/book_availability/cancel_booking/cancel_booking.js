var pageSession = new ReactiveDict();

Template.CancelBooking.rendered = function() {
	pageSession.set("errorMessage", "");
    var cancelBookingToken = Router.current().params.cancelBookingToken;
  if (cancelBookingToken) {
      /*Availabilities.verifyBooking(verifyBookingToken, function (err) {
          if (err) {
            pageSession.set("errorMessage", err.message);
          }
      });*/
      pageSession.set("errorMessage", cancelBookingToken);
  }
  /*else {
    pageSession.set("errorMessage", err.message);
  }*/
	
};

Template.CancelBooking.events({
  "click .go-home": function(e, t) {
    Router.go("/");
  }
  
});

Template.CancelBooking.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  }
  
});
