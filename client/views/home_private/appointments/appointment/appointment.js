var pageSession = new ReactiveDict();
var appointment;

function dataReady() {
    if (appointment){
        return true
    } else {
        return false
    }
}

Template.Appointment.onCreated(function bodyOnCreated() {
    appointment = this.data;
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
    },
    itemsReady:function() {
        return dataReady();
    },
    getFrom: function() {
       return appointment.startDate
    },
    getTo: function () {
        return appointment.endDate
    },
    getName:function(){
        return appointment.bookedByName
    },
    getConfirmationStatus: function () {
        return appointment.bookedByConfirmed
    },
    getEmail: function () {
        return appointment.bookedByEmail
    },
    getBookedOn: function () {
        return appointment.bookedByDate
    }
    
});
