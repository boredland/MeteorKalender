var pageSession = new ReactiveDict();
import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

function getEvents(){
    let data = Availabilities.find().fetch().map( ( availability ) => {
        //availability.editable = true; //availability.startDate
        //var calendar = Calendars.find({_id: availability.calendarId});
        if (availability !== undefined){
            availability = {start: availability.startDate,end: availability.endDate, id: availability._id};
            return availability;
        }
    });
    return data;
}

function getMinTime() {
    var events = getEvents();
    var minTime;
    if (events.length > 0) {
        minTime=events[0].start;
        for (var i = 1; i < events.length; i++) {
            //console.log(events[i].start);
            if (moment(events[i].start).get('h') <= moment(minTime).get('h') && moment(events[i].start).get('m') < moment(minTime).get('m')) {
                minTime = events[i].start;
            }
        }

        minTime = moment(minTime);
        //console.log("Mintime: ",minTime);
        var minTimeString = minTime.get('h')+":"+minTime.get('m')+":00";
        //console.log(minTimeString);
        return minTimeString;
    }

}

function getMaxTime() {
    
}

Template.CalendarPublic.onCreated(function bodyOnCreated() {
    }
);

Template.CalendarPublic.rendered = function() {
    var calendarPublicToken = Router.current().params.calendarPublicToken;
    //Meteor.subscribe('publicCalendar', calendarPublicToken)
    Meteor.subscribe('calendarAvailabilities', calendarPublicToken);
    Meteor.subscribe('singleCalendarName', calendarPublicToken);
    pageSession.set("errorMessage", "");
};

Template.CalendarPublic.events({

});

Template.CalendarPublic.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  },
  getCalendarAvailabilities(){
    return Availabilities.find();
  },
  getCalendarName() {
      return Calendars.find();
  },
  publicCalendarOptions: {
        // Standard fullcalendar options
        //editable: true,
        defaultView: 'listWeek',
        //hiddenDays: [ 0 ],
        //slotDuration: '00:05:00',
        //minTime: '08:00:00',
        //maxTime: '21:00:00',
        lang: 'de',
        // Function providing events reactive computation for fullcalendar plugin
        events( start, end, timezone, callback ) {
            let data = getEvents();
            if ( data ) {
                callback( data );
            }
        },
        /*eventClick: function(calEvent, jsEvent, view) {
            if (calEvent.start > moment()){
                Router.go("home_private.edit_availability",{_eventId: calEvent.id});
            } else if (calEvent.start < moment()){
                console.log("The event is in the past. You are not allowed to edit."); //<-- Perhaps this may be added as a pagesession error message..?
            }
        },*/
        // Optional: id of the calendar
        id: "publicCalendar",
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
