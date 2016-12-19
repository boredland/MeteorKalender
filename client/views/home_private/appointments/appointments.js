import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.Appointments.helpers({
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    },
    appointmentsCalendarOptions: function(){
        return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,true),pageSession);
    }
});
