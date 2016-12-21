import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var availability;
var pageSession = getDefaultPageSession();

window.Availabilities = Availabilities;

Template.EditAvailability.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    },
    "click #dataview-delete-button": function(e) {
        e.preventDefault();
        var dialog_delete = bootbox.dialog({
            message: "Do you want to delete this availability?",
            title: "Delete event",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        /*Meteor.call('availabilities.remove', getCurrentAvailabilityId());
                         Router.go('home_private.availabilities');*/
                        dialog_delete.modal('hide');
                        var dialog_future_past = bootbox.dialog({
                            title: "Repetitons?",
                            animate: false,
                            message: "Do you want to remove this including its repetitions?",
                            buttons: {
                                future: {
                                    label: "Only those in the future",
                                    className: "btn-primary",
                                    callback: function() {
                                        dialog_future_past.modal('hide');
                                        var family = bootbox.dialog({
                                            message: "Do you want to delete the family of availabilities created with this one too?",
                                            title: "Delete family",
                                            animate: false,
                                            buttons: {
                                                danger: {
                                                    label: "Yes",
                                                    className: "btn-primary",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureFamily', getCurrentAvailabilityId());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                },
                                                success: {
                                                    label: "No",
                                                    className: "btn-default",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureRepetitions', getCurrentAvailabilityId());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                all: {
                                    label: "All of them",
                                    className: "btn-primary",
                                    callback: function () {
                                        dialog_future_past.modal('hide');
                                        var family = bootbox.dialog({
                                            message: "Do you want to delete the family of availabilities created with this one too?",
                                            title: "Delete family",
                                            animate: false,
                                            buttons: {
                                                danger: {
                                                    label: "Yes",
                                                    className: "btn-primary",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureFamily', getCurrentAvailabilityId(),new Date());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                },
                                                success: {
                                                    label: "No",
                                                    className: "btn-default",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureRepetitions', getCurrentAvailabilityId(),new Date());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                no: {
                                    label: "No",
                                    className: "btn-default",
                                    callback: function () {
                                        Meteor.call('availabilities.remove', getCurrentAvailabilityId());
                                        Router.go('home_private.availabilities');
                                    }
                                }
                            }
                        });
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

Template.EditAvailability.helpers({
    updateDoc: function () {
        return Availabilities.findOne({});
    },
    getPageSession: function () {
        return pageSession
    }
});

AutoForm.hooks({
    availabilityUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        }
    }
});