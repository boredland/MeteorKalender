import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.CalendarPublic.helpers({
    CurrentCalendarName() {
      return Calendars.findOne({}).name;
    },
    publicCalendarOptions: function(){
        return {
            events: function(start, end, timezone, callback) {
                callback(getCalendarEvents(Availabilities.find({}).fetch(),Calendars,false));
            },
            eventClick: function(calEvent, jsEvent, view) {
                calendarClickOptions(calEvent);
            },
            defaultView: 'listWeek',
            timeFormat: 'H:mm'
        };
    },
    getPageSession: function () {
        return pageSession
    }
});