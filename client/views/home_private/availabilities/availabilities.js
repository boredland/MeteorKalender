import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = new ReactiveDict();

Template.Availabilities.onRendered( () => {

});

Template.Availabilities.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('allFutureAvailabilities');
        Meteor.subscribe('allCalendars');
    }
);

Template.Availabilities.rendered = function() {
    pageSession.set("invoicesInsertInsertFormInfoMessage", "");
    pageSession.set("invoicesInsertInsertFormErrorMessage", "");

};

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
        //editable: true,
        defaultView: 'listWeek',
        //hiddenDays: [ 0 ],
        //slotDuration: '01:00:00',
        //minTime: '08:00:00',
        //maxTime: '19:00:00',
        lang: 'de',
        // Function providing events reactive computation for fullcalendar plugin
        events( start, end, timezone, callback ) {
            let data = Availabilities.find().fetch().map( ( availability ) => {
                //availability.editable = true; //availability.startDate
                var calendar = Calendars.findOne({_id: availability.calendarId.toString()});
                if (availability !== undefined){
                    availability = {start: availability.startDate,end: availability.endDate,color: calendar.color, title: calendar.name, id: availability._id};
                    return availability;
                }
            });
            if ( data ) {
                callback( data );
            }
        },
        eventClick: function(calEvent, jsEvent, view) {
            if (calEvent.start > moment()){
                Router.go("home_private.edit_availability",{_eventId: calEvent.id});
            } else if (calEvent.start < moment()){
                console.log("The event is in the past. You are not allowed to edit."); //<-- Perhaps this may be added as a pagesession error message..?
            }
        },
        // Optional: id of the calendar
        id: "availabilitiesCalendar",
        // Optional: Additional classes to apply to the calendar
        //addedClasses: "col-md-8",
        // Optional: Additional functions to apply after each reactive events computation
        //    autoruns: [
        //    function () {
        //        console.log("user defined autorun function executed!");
        //    }
        //]
    }
});
