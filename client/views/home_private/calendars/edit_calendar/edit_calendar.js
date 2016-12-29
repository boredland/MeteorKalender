import {Calendars} from '/imports/api/calendarsCollection';
import {} from '/public/js/bootstrap-colorselector';
var pageSession = getDefaultPageSession();
window.Calendars = Calendars;

Template.EditCalendar.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    }
});

Template.EditCalendar.helpers({
    getPageSession: function () {
        return pageSession;
    },
    updateDoc: function () {
        return Calendars.findOne({_id: Router.current().params._calendarId});
    }
});

Template.EditCalendar.onRendered(function(){
    this.$('#colorselector').colorselector();
});

AutoForm.hooks({
    calendarUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});