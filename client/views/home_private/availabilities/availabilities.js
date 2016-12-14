import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = new ReactiveDict();

var getData = function(){
    return Availabilities.find().fetch().map( ( availability ) => {
        //availability.editable = true; //availability.startDate
        var calendar = Calendars.findOne({_id: availability.calendarId.toString()});
        var title, status;
        if (availability.bookedByConfirmed) {
            title = " (booked)";
            status = false;
        } else if (moment(availability.bookedByDate) < moment().add(-10,'m') && !availability.bookedByConfirmed){
            title = " (reserved)";
            status = false;
        } else {
            title = " (free)";
            status = true;
        }
        if (availability !== undefined){
            availability = {start: availability.startDate,end: availability.endDate,color: calendar.color, title: calendar.name+title, id: availability._id, status: status};
            return availability;
        }
    });
};

Template.Availabilities.onRendered( () => {

});

Template.Availabilities.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allFutureAvailabilities',0);
    Meteor.subscribe('allCalendars');
    pageSession.set("errorMessage", "");
});

Template.Availabilities.rendered = function() {

};

Template.Availabilities.created = function() {

};

Template.Availabilities.events({
    "click #dataview-insert-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.new_availability", {});
    },
});
Template.Availabilities.events({
    "click #delete-all-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Delete all availabilities? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('availabilities.removeAll');
                        Router.go('home_private.availabilities');
                    }
                },
                danger: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    }
});

Template.Availabilities.helpers({
    "errorMessage": function() {
        var getError = Router.current().params.query.error;
        if (getError) {
            pageSession.set("errorMessage", getError);
        }
        return pageSession.get("errorMessage");
    },
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
            let data = getData();
            if ( data ) {
                callback( data );
            }
        },
        eventClick: function(calEvent, jsEvent, view) {
            if (calEvent.start > moment()){
                if (calEvent.status) {
                    Router.go("home_private.edit_availability",{_eventId: calEvent.id});
                } else if (!calEvent.status){
                    Router.go("home_private.appointment",{_eventId: calEvent.id});
                }
            } else if (calEvent.start < moment()){
                pageSession.set("errorMessage", "The event is in the past. You are not allowed to edit.");
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
