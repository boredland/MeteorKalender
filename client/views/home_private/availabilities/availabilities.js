import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = new ReactiveDict();

Template.Availabilities.onRendered(function() {

});

Template.Availabilities.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('allAvailabilities');
        Meteor.subscribe('allCalendars');
    }
);

Template.Availabilities.rendered = function() {
    pageSession.set("invoicesInsertInsertFormInfoMessage", "");
    pageSession.set("invoicesInsertInsertFormErrorMessage", "");
};
Template.Availabilities.helpers({

});

Template.Availabilities.created = function() {

};

Template.Availabilities.events({
    "click #dataview-insert-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.new_availability", {});
    },
});

Template.Availabilities.helpers({
    availibilityCalendarOptions: {
        // Standard fullcalendar options
        defaultView: 'listWeek',
        //hiddenDays: [ 0 ],
        //slotDuration: '01:00:00',
        //minTime: '08:00:00',
        //maxTime: '19:00:00',
        lang: 'de',
        // Function providing events reactive computation for fullcalendar plugin
        events( start, end, timezone, callback ) {
            let data = Availabilities.find().fetch().map( ( availability ) => {
                //event.editable = !isPast( event.start );
                var calendar = Calendars.findOne({}, {_id: availability.calendarId});
                if (availability !== undefined){
                    availability = {start: availability.startDate,end: availability.endDate,color: calendar.color, title: calendar.name};
                    return availability;
                }
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
