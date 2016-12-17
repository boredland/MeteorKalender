var pageSession = new ReactiveDict();
var appointment;

function dataReady() {
    if (appointment){
        return true
    } else {
        return false
    }
}
function getCurrentAvailabilityId(){
    var currentId = Router.current().params._eventId;
    if (currentId != undefined) {
        return currentId;
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
    "click #dataview-cancel-button": function(e) {
        // Das hier sollte halt dann ein Inhalt aus einem Freitextfeld im Modaldialog sein.
        var reason = "so reasonable";
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to cancel the appointment?",
            title: "Cancel appointment",
            animate: false,
            buttons: {
                yescancel: {
                    label: "Yes, and delete availability",
                    className: "btn-primary",
                    callback: function() {
                        Meteor.call('booking.cancelByOwner',getCurrentAvailabilityId(),reason, function(error, result){
                            if (!error){
                                Meteor.call('availabilities.remove',getCurrentAvailabilityId());
                                Router.go('home_private.appointments');
                            }
                        });
                    }
                },
                yeskeep: {
                    label: "Yes, and keep availability",
                    className: "btn-primary",
                    callback: function () {
                        Meteor.call('booking.cancelByOwner',getCurrentAvailabilityId(),reason,function (error,result) {
                            if (!error){
                                Router.go('home_private.appointments');
                            }
                        });
                    }
                },
                no: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
    },
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
