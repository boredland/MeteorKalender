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
                        Meteor.call('calendars.remove', getCurrentCalendarId());
                        Router.go('home_private.calendars');
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

Template.EditCalendar.helpers({
    getCalendars(){
        return Calendars.find();
    }
});

AutoForm.hooks({
    calendarEditForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});