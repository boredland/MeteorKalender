import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = new ReactiveDict();
var availabilitiesSubscription,calendarsSubscription;

function getEvents(){
    var data = Availabilities.find({bookedByConfirmed: true}).fetch().map( ( appointment ) => {
        //event.editable = !isPast( event.start );
        var calendar = [];
        calendar = Calendars.findOne({_id: appointment.calendarId.toString()});
        if (appointment !== undefined){
            appointment = { id: appointment._id, start: appointment.startDate,end: appointment.endDate,color: calendar.color, title: appointment.bookedByName};
            return appointment;
        }
    });
    return data;
}

function dataReady() {
    if (getEvents()){
        return true
    } else {
        return false
    }
}

Template.Appointments.onCreated(
    function bodyOnCreated() {
        availabilitiesSubscription = Meteor.subscribe('allFutureAvailabilities',30);
        calendarsSubscription = Meteor.subscribe('allCalendars');
        if (availabilitiesSubscription.ready() && calendarsSubscription.ready()) {
            console.log("Both subscriptions are ready.")
        }
        pageSession.set("errorMessage", "");
    }
);

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
    itemsReady:function() {
        return dataReady();
    },
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
            data = getEvents();
            if ( data ) {
                callback( data );
            }
        },
        eventClick: function(calEvent, jsEvent, view) {
            Router.go("home_private.appointment",{_eventId: calEvent.id});
        },
        timeFormat: 'H(:mm)',
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
