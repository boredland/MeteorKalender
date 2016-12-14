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

function getCurrentAvailability() {
    var availability = Availabilities.findOne({_id: getCurrentAvailabilityId()});
    if (availability != undefined){
        return availability;
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
        e.preventDefault();
        console.log("Pressed Cancel");
        bootbox.dialog({
            message: "Want to Cancel?",
            title: "Cancel",
            animate: false,
            buttons: {
                success: {
                    label: "Yes, with delete availability",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('availabilities.remove',getCurrentAvailabilityId());
                        Router.go('home_private.appointments');
                    }
                },
                danger: {
                    label: "Yes, without delete availability",
                    className: "btn-default",
                    callback: function () {
                        meteor.call('');
                        Router.go('home_private.appointments');
                    }
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
