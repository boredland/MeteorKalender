Template.HomePublic.rendered = function() {
	
};

Template.HomePublic.events({
	
});

Template.HomePublic.helpers({
	options: function() {
		return {
			defaultView: 'agendaWeek'
		};
	}
});

Template.HomePublicHomeJumbotron.rendered = function() {
	
};

Template.HomePublicHomeJumbotron.events({
	"click #jumbotron-button": function(e, t) {
		e.preventDefault();
		Router.go("login", {});
	}
	
});

Template.HomePublicHomeJumbotron.helpers({
	
});
