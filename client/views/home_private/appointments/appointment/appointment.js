var pageSession = getDefaultPageSession();

Template.Appointment.events({
    "click #dataview-cancel-button": function(event) {
        // Das hier sollte halt dann ein Inhalt aus einem Freitextfeld im Modaldialog sein.
        var reason;
        event.preventDefault();
        var prompt = bootbox.prompt({
            animate: false,
            title: "Please provide a reason for your cancellation:",
            inputType: "textarea",
            value: "Ex.: Sadly i am ill today.",
            callback: function(result){
                if (result === null) {
                    // Prompt dismissed
                } else {
                    reason = result;
                    prompt.modal('hide');
                    bootbox.dialog({
                        title: "Cancel appointment",
                        animate: false,
                        message: "Would would you like to do with the availability?",
                        buttons: {
                            yescancel: {
                                label: "Yes, and delete availability",
                                className: "btn-primary",
                                callback: function() {
                                    Meteor.call('booking.cancelByOwner',Availabilities.findOne({})._id,reason, function(error, result){
                                        if (!error){
                                            Meteor.call('availabilities.remove',Availabilities.findOne({})._id);
                                            history.back();
                                        }
                                    });
                                }
                            },
                            yeskeep: {
                                label: "Yes, and keep availability",
                                className: "btn-primary",
                                callback: function () {
                                    Meteor.call('booking.cancelByOwner',Availabilities.findOne({})._id,reason,function (error,result) {
                                        if (!error){
                                            history.back();
                                        }
                                    });
                                }
                            },
                            no: {
                                label: "No",
                                className: "btn-default"
                            }
                        }
                    })
                }
            }
        });
    },
    "click #Back-button": function(event, templateInstance) {
        event.preventDefault();
        history.back();
    }
});

Template.Appointment.helpers({
    getPageSession: function () {
        return pageSession
    },
    getAppointment: function () {
        return Availabilities.findOne({})
    },
    isInTheFuture: function () {
        if (Availabilities.findOne({}).startDate >= new Date()){
            return true;
        }
        return false;
    }
});
