import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

Router.map(function () {
    Router.route('ical', {
        name: 'ical',
        path: "ical/:_token",
        where: 'server',
        waitOn: function () {
            return [
                Meteor.subscribe('allAppointments'),
                Meteor.subscribe('allCalendars')
            ]
        },
        action: function() {
            var user = Meteor.users.findOne(this.params._token);
            var currentEvents = getCalendarEvents(Availabilities.find({userId: user._id,startDate: {$gt: new Date()},bookedByConfirmed: true}).fetch(), Calendars, true);
            let calendar = new IcsGenerator({prodId: "//MeteorKalender//Frankfurt University of Applied Sciences",
                version: "2.0",
                method: "REQUEST",
                events: []
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
            calendar = calendar.toIcsString()
            this.response.writeHead(200, {
                'Content-Type': 'text/plain;charset=utf-8'
            });
            this.response.write(calendar);
            this.response.end();
            console.log("before",calendar);
            calendar = null;
            console.log("after",calendar);
        }
    });
});
