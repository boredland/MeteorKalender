import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";
import {Calendars} from '/imports/api/calendarsCollection';

Template.NewAvailability.onRendered( () => {

});

Template.NewAvailability.rendered = function() {

};

Template.NewAvailability.created = function() {

};

Template.AvailabilityInsertForm.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('allCalendars');
    }
);

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