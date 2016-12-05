import {Calendars} from '/imports/api/calendarsCollection';

Template.NewCalendar.onRendered( () => {

});

Template.NewCalendar.rendered = function() {

};

Template.NewCalendar.created = function() {

};

Template.NewCalendar.events({

});

Template.NewCalendar.helpers({

});


Template.CalendarInsertForm.helpers({
    formCollection() {
        return Calendars;
    }
});

AutoForm.hooks({
    calendarInsertForm: {
        onSuccess: function() {
            Router.go('home_private.calendars');
        }
    }
});