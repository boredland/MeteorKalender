import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";

Template.NewAvailability.onRendered( () => {

});

Template.NewAvailability.rendered = function() {

};

Template.NewAvailability.created = function() {

};

Template.NewAvailability.events({

});

Template.NewAvailability.helpers({

});

Template.AvailabilityInsertForm.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
});


AutoForm.hooks({
    availabilityInsertForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        }
    }
});