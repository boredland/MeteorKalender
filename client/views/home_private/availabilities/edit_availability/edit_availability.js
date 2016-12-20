import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
var availability;
var pageSession = getDefaultPageSession();

window.Availabilities = Availabilities;
function getCurrentAvailabilityId(){
    var currentId = Router.current().params._eventId;
    if (currentId !== undefined) {
        return currentId;
    }
}
function dataReady() {
    if (availability){
        return true
    } else {
        return false
    }
}

Template.EditAvailability.onCreated(function bodyOnCreated() {
    availability = this.data;
});

Template.EditAvailability.rendered = function() {

};

Template.EditAvailability.created = function() {

};

Template.EditAvailability.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    },
    "click #dataview-delete-button-family": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete all availabilities which belong to this one? Reserved or booked onces wont be deleted.",
            title: "Delete whole family of availabilities",
            animate: false,
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        Meteor.call('availabilities.removeByFamilyId', getCurrentAvailabilityId());
                        Router.go('home_private.availabilities');
                    }
                },
                no: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    },
    "click #dataview-delete-button-repetitions": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete this availability and all of its future unbooked repetitions?",
            title: "Delete repetitions",
            animate: false,
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        Meteor.call('availabilities.removeFutureRepetitions', getCurrentAvailabilityId());
                        Router.go('home_private.availabilities');
                    }
                },
                no: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    },
    "click #dataview-delete-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete this availability?",
            title: "Delete event",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        Meteor.call('availabilities.remove', getCurrentAvailabilityId());
                        Router.go('home_private.availabilities');
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
        return availability;
    },
    itemsReady:function() {
        return dataReady();
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