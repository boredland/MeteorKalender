import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.Appointments.rendered = function() {
    pageSession = nullMessages(pageSession);
};

Template.Appointments.helpers({
    getPageSession: function () {
        return pageSession
    },
    appointmentsCalendarOptions: function(){
        return {
            events: function(start, end, timezone, callback) {
                callback(getCalendarEvents(Availabilities.find({}).fetch(),Calendars,true));
            },
            eventClick: function(calEvent, jsEvent, view) {
                calendarClickOptions(calEvent);
            },
            defaultView: 'listWeek',
            timeFormat: 'H:mm',
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'listDay, listWeek, listYear'
            },
            buttonText: {
                listDay: 'Day',
                listWeek: 'Week',
                listYear: 'Year'
            }
        };
    }
});
