//var pageSession = new ReactiveDict();
import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

Template.Appointments.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('allAvailabilities');
        Meteor.subscribe('allCalendars');
    }
);

Template.Appointments.onRendered( () => {
    /*$( '#appointments-calendar' ).fullCalendar({
        events( start, end, timezone, callback ) {
            let data = Availabilities.find().fetch().map( ( appointment ) => {
                //event.editable = !isPast( event.start );
                appointment = {start: appointment.startDate,end: appointment.endDate, title: 'test'};
                console.log(appointment);
                return appointment;
            });
            console.log(data);
            if ( data ) {
                callback( data );
            }
        },
        defaultView: 'listWeek'
    });*/
    /*
    Tracker.autorun( () => {
        Availabilities.find().fetch();
        $( '#events-calendar' ).fullCalendar( 'refetchEvents' );
    });*/

});

Template.Appointments.rendered = function() {
};

Template.Appointments.created = function() {
};

Template.Appointments.events({
});

Template.Appointments.helpers({
    appointmentsCalendarOptions: {
        // Standard fullcalendar options
        defaultView: 'listWeek',
        //hiddenDays: [ 0 ],
        //slotDuration: '01:00:00',
        //minTime: '08:00:00',
        //maxTime: '19:00:00',
        lang: 'de',
        // Function providing events reactive computation for fullcalendar plugin
        events( start, end, timezone, callback ) {
            let data = Availabilities.find().fetch().map( ( appointment ) => {
                //event.editable = !isPast( event.start );
                //console.log(appointment.calendarId);
                var calendar = Calendars.findOne({}, {_id: appointment.calendarId});
                console.log(calendar.color);
                appointment = {start: appointment.startDate,end: appointment.endDate,color: calendar.color, title: calendar.name};
                return appointment;
            });
            if ( data ) {
                callback( data );
            }
        },
        // Optional: id of the calendar
        //id: "appointmentscalendar",
        // Optional: Additional classes to apply to the calendar
        //addedClasses: "col-md-8",
        // Optional: Additional functions to apply after each reactive events computation
        //    autoruns: [
        //    function () {
        //        console.log("user defined autorun function executed!");
        //    }
        //]
    },
});
