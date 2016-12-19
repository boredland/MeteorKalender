import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = new ReactiveDict();

Template.Appointments.onCreated(function bodyOnCreated() {
    pageSession.set("errorMessage", "");
});

Template.Appointments.onRendered( () => {

});

Template.Appointments.rendered = function() {
};

Template.Appointments.created = function() {
};

Template.Appointments.events({

});

Template.Appointments.helpers({
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    },
    appointmentsCalendarOptions: function(){
        return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,true),pageSession);
    }
});
