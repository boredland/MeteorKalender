import {Calendars} from '/imports/api/calendarsCollection';
import {} from '/public/js/bootstrap-colorselector';
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
    },
    getPageSession: function () {
        return pageSession;
    }
});


Template.NewCalendar.onRendered(function(){
    this.$('#colorselector').colorselector();
});

AutoForm.hooks({
    calendarInsertForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});