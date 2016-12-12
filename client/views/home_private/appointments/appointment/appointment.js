var pageSession = new ReactiveDict();

Template.Appointment.onCreated(function bodyOnCreated() {
        pageSession.set("errorMessage", "");
});

Template.Appointment.onRendered( () => {

});

Template.Appointment.rendered = function() {
};

Template.Appointment.created = function() {
};

Template.Appointment.events({

});

Template.Appointment.helpers({
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    }
});
