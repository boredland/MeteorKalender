var pageSession = new ReactiveDict();

Template.CalendarPublic.rendered = function() {
	pageSession.set("errorMessage", "");

  var calendarPublicToken = Router.current().params.calendarPublicToken;
  if (calendarPublicToken) {
      pageSession.set("errorMessage", "Wie es in den Wald hineinschallt, "+calendarPublicToken);
  }
	
};

Template.CalendarPublic.events({
  /*"click .go-home": function(e, t) {
    Router.go("/");
  }*/
  
});

Template.CalendarPublic.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  }
  
});
