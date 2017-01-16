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
                    className: "btn btn-danger",
                    callback: function() {
                        dialog_delete.modal('hide');
                        var dialog_future_past = bootbox.dialog({
                            title: "Repetitons?",
                            animate: false,
                            message: "Do you want to remove this including its' repetitions?",
                            buttons: {
                                future: {
                                    label: "Only those in the future",
                                    className: "btn btn-warning",
                                    callback: function() {
                                        dialog_future_past.modal('hide');
                                        var family = bootbox.dialog({
                                            message: "Do you want to delete the family of availabilities created with this one, too?",
                                            title: "Delete future family",
                                            animate: false,
                                            buttons: {
                                                danger: {
                                                    label: "Yes",
                                                    className: "btn btn-danger",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureFamily', Availabilities.findOne({})._id);
                                                        Router.go('home_private.availabilities');
                                                    }
                                                },
                                                success: {
                                                    label: "No",
                                                    className: "btn-default",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureRepetitions', Availabilities.findOne({})._id);
                                                        Router.go('home_private.availabilities');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                all: {
                                    label: "All of them",
                                    className: "btn btn-danger",
                                    callback: function () {
                                        dialog_future_past.modal('hide');
                                        var family = bootbox.dialog({
                                            message: "Do you want to delete the family of availabilities created with this one, too?",
                                            title: "Delete whole family",
                                            animate: false,
                                            buttons: {
                                                danger: {
                                                    label: "Yes",
                                                    className: "btn btn-danger",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureFamily', Availabilities.findOne({})._id,new Date());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                },
                                                success: {
                                                    label: "No",
                                                    className: "btn-default",
                                                    callback: function() {
                                                        Meteor.call('availabilities.removeFutureRepetitions', Availabilities.findOne({})._id,new Date());
                                                        Router.go('home_private.availabilities');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                },
                                no: {
                                    label: "No",
                                    className: "btn btn-success",
                                    callback: function () {
                                        Meteor.call('availabilities.remove', Availabilities.findOne({})._id);
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
        return Availabilities.findOne({_id: Router.current().params._availabilityId});
    },
    getPageSession: function () {
        return pageSession
    }
});

AutoForm.hooks({
    availabilityUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        },
        onError: function (operation, error, template) {
            if (error.error === "overlap") {
                Router.go('home_private.availabilities',{},{query: 'error='+error.reason});
            }
        }
    }
});