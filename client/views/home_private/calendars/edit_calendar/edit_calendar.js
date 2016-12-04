Template.EditCalendar.onRendered( () => {

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
Template.CalendarInsertForm.helpers({
    formCollection() {
        return Calendars;
    }
});