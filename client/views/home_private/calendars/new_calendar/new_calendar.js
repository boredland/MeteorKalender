import {Calendars} from '/imports/api/calendarsCollection';

Template.NewCalendar.onRendered( () => {

});

Template.NewCalendar.rendered = function() {

};

Template.NewCalendar.created = function() {

};

Template.NewCalendar.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.calendars", {});

    }



});

Template.NewCalendar.helpers({
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