import {Calendars} from '/imports/api/calendarsCollection';

function getCurrentCalendarId(){
    var currentId = Router.current().params._calendarId;
    if (currentId != undefined) {
        console.log(currentId);
        return currentId;
    }
}

Template.EditCalendar.onRendered( () => {
    getCurrentCalendarId();
});

Template.EditCalendar.rendered = function() {

};

Template.EditCalendar.created = function() {

};

Template.EditCalendar.events({

});

Template.EditCalendar.helpers({
    getCalendars(){
        return Calendars.find();
    }
});