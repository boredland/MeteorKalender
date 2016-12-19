import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.Appointments.helpers({
    getPageSession: function () {
        return pageSession
    },
    appointmentsCalendarOptions: function(){
        return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,true),pageSession);
    }
});
