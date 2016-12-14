import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = new ReactiveDict();

Template.NewAvailability.onRendered( () => {

});

Template.NewAvailability.rendered = function() {

};

Template.NewAvailability.created = function() {

};

Template.NewAvailability.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allCalendars');
    pageSession.set("errorMessage", "");
});

Template.NewAvailability.events({

});

Template.NewAvailability.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    },
});

AutoForm.hooks({
    availabilityInsertForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        },
        onError: function (operation, error, template) {
            Router.go('home_private.availabilities',{},{query: 'error='+error.reason});
        }
    }
});