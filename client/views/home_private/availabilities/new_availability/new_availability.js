import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.NewAvailability.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allCalendars');
});

Template.NewAvailability.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.availabilities", {});
    }
});

Template.NewAvailability.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    }
});

AutoForm.hooks({
    availabilityInsertForm: {
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