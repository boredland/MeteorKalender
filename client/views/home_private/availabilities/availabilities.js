import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = getDefaultPageSession();

Template.Availabilities.events({
    "click #dataview-insert-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.new_availability", {});
    }

});
Template.Availabilities.events({
    "click #delete-all-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete all availabilities?",
            title: "Delete all availabilities",
            animate: false,
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('availabilities.removeAll');
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
    }
});

Template.Availabilities.helpers({
    getPageSession: function () {
        return pageSession;
    },
    availibilityCalendarOptions: function(){
        return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,true),pageSession);
    }
});
