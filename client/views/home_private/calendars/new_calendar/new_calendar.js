import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.NewCalendar.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.calendars", {});
    }
});

Template.NewCalendar.helpers({
    formCollection() {
        return Calendars;
    }
});

AutoForm.hooks({
    calendarInsertForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});