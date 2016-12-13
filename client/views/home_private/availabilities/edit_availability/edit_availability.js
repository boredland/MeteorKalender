import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

window.Availabilities = Availabilities;
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

Template.EditAvailability.rendered = function() {

};

Template.EditAvailability.created = function() {

};

Template.EditAvailability.events({
    "click #dataview-delete-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Delete? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
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

Template.EditAvailability.events({
    "click #dataview-delete-button-family": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Delete by FamilyID? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                      //  Meteor.call(()); muss noch implementiert werden
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
Template.EditAvailability.events({
    "click #dataview-delete-button-chunk": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Delete by ChunkID? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                       // Meteor.call(()); muss noch implementiert werden
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

});

Template.AvailabilityUpdateForm.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('singleAvailability', getCurrentAvailabilityId());
        Meteor.subscribe('allCalendars');
    }
);

Template.AvailabilityUpdateForm.helpers({
    updateDoc: function () {
        return getCurrentAvailability();
    }
});

AutoForm.hooks({
    availabilityUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        }
    }
});