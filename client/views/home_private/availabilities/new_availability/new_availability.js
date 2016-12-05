import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";

Template.NewAvailability.onRendered( () => {

});

Template.NewAvailability.rendered = function() {

};

Template.NewAvailability.created = function() {

};

Template.NewAvailability.events({
    "click #delete-button": function(e) {
        e.preventDefault();
        var me = this;
        bootbox.dialog({
            message: "Delete? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('availabilities.remove', me._id);
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

Template.NewAvailability.helpers({

});

Template.AvailabilityInsertForm.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
});


AutoForm.hooks({
    calendarInsertForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        }
    }
});