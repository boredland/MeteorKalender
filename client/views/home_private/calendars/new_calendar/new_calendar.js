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


AutoForm.hooks({
    calendarInsertForm: {
        onSuccess: function() {
            console.log("sdiusud")
            Router.go('home_private.calendars');
        }
    }

});