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

function areThereAvailabilitiesIn(){

}

Template.EditCalendar.onRendered( () => {
    pageSession.set("errorMessage", "");
});

Template.EditCalendar.rendered = function() {

};

Template.EditCalendar.created = function() {

};

Template.EditCalendar.helpers({
    "errorMessage": function () {
        return pageSession.get("errorMessage");
    }
});

Template.EditCalendar.events({
    /*
    "click #dataview-delete-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Delete? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('calendars.remove',getCurrentCalendarId(), function(err, data) {
                            console.log("error",err.error)
                            if (err && err.error === "bingoerror") {
                                pageSession.set("errorMessage", err.reason);
                                console.log("reason",err.reason)
                            } else {
                                Router.go('home_private.calendars');
                            }
                        });
                    }
                },
                danger: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    }*/
    "click #Back-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.calendars", {});
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