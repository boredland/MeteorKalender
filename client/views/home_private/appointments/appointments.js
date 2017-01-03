import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.Appointments.rendered = function () {
    nullMessages(pageSession);
};

Template.Appointments.events ({
    "click #dataview-download-button": function (e, t) {
        e.preventDefault();
        var user = Meteor.user();
        var currentEvents = getCalendarEvents(Availabilities.find({}).fetch(), Calendars, true);
        console.log("events",currentEvents);
        var calendar = new IcsGenerator({prodId: "//MeteorKalender//Frankfurt University of Applied Sciences",
            method: "REQUEST",
        });
        for (var i = 0;i<currentEvents.length;i++){
            var newEvent = calendar.createEvent({
                uid: currentEvents[i].id+"@meteorkalender",
                summary: currentEvents[i].title,
                dtStart: currentEvents[i].start,
                dtEnd: currentEvents[i].end,
                organizer: {cn: user.profile.name, mailTo: user.emails[0].address},
                attendees: [
                    {cn: currentEvents[i].attendee_name, mailTo: currentEvents[i].attendee_mail}
                ]
            });
            calendar.addEvent(newEvent);
        }
        var blob = new Blob( [ calendar.toIcsString() ], {type: "text/plain;charset=utf-8"});
        saveAs(blob, user.profile.name+"_meteorkalendar_appointments.ics");
    }
});

Template.Appointments.helpers({
    getPageSession: function () {
        return pageSession
    },
    appointmentsCalendarOptions: function () {
        return {
            events: function (start, end, timezone, callback) {
                callback(getCalendarEvents(Availabilities.find({}).fetch(), Calendars, true));
            },
            eventClick: function (calEvent, jsEvent, view) {
                calendarClickOptions(calEvent, pageSession);
            },
            height: function () {
                return window.innerHeight * 0.6;
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
            viewRender: function (currentView) {
                var maxDate, minDate;
                try {
                    maxDate = moment(Availabilities.findOne({}, {sort: {startDate: -1}}).startDate)
                } catch (e) {
                    maxDate = moment();
                }
                try {
                    minDate = moment(Availabilities.findOne({}, {sort: {endDate: 1}}).endDate);
                } catch (e) {
                    minDate = moment();
                }
                // replace the prev / next icons
                $(".fc-prev-button").html('<i class="fa fa-angle-left" aria-hidden="true"></i>');
                $(".fc-next-button").html('<i class="fa fa-angle-right" aria-hidden="true"></i>');
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
