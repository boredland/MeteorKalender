import {availabilitiesFormSchema} from "../../../../../imports/api/availabilitiesSchema";
import {Calendars} from '/imports/api/calendarsCollection';
var pageSession = getDefaultPageSession();

Template.NewAvailability.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allCalendars');
});

Template.NewAvailability.events({
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
    }
});

Template.NewAvailability.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
    getPageSession: function () {
        return pageSession;
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