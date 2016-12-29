import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.Appointments.rendered = function() {
    nullMessages(pageSession);
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
                calendarClickOptions(calEvent,pageSession);
            },
            defaultView: 'listYear',
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
            },
            viewRender: function(currentView){
                try {
                    var maxDate = moment(Availabilities.findOne({}, {sort: {startDate: -1}}).startDate),
                        minDate = moment(Availabilities.findOne({}, {sort: {endDate: 1}}).endDate);
                } catch (e) {
                    console.log("Events-array empty.")
                }
                // Past
                if (minDate >= currentView.start && minDate <= currentView.end) {
                    $(".fc-prev-button").prop('disabled', true);
                    $(".fc-prev-button").addClass('fc-state-disabled');
                }
                else {
                    $(".fc-prev-button").removeClass('fc-state-disabled');
                    $(".fc-prev-button").prop('disabled', false);
                }
                // Future
                if (maxDate >= currentView.start && maxDate <= currentView.end) {
                    $(".fc-next-button").prop('disabled', true);
                    $(".fc-next-button").addClass('fc-state-disabled');
                } else {
                    $(".fc-next-button").removeClass('fc-state-disabled');
                    $(".fc-next-button").prop('disabled', false);
                }
            }
        };
    }
});
