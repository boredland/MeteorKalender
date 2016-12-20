import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = new ReactiveDict();
window.Calendars = Calendars;

function getCurrentCalendarId(){
    var currentId = Router.current().params._calendarId;
    if (currentId !== undefined) {
        return currentId;
    }
}
function getCurrentCalendar() {
    var calendar = Calendars.findOne({_id: getCurrentCalendarId()});
    if (calendar !== undefined){
        return calendar;
    }
}

Template.EditCalendar.onRendered( () => {
    pageSession.set("errorMessage", "");
});

Template.EditCalendar.helpers({
    getPageSession: function () {
        return pageSession;
    }
});

Template.EditCalendar.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    }
});

Template.CalendarUpdateForm.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('singleCalendar',getCurrentCalendarId());
    }
);

Template.CalendarUpdateForm.helpers({
    updateDoc: function () {
        return getCurrentCalendar();
    }
});

AutoForm.hooks({
    calendarUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});