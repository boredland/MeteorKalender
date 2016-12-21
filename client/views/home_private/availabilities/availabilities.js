import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = getDefaultPageSession();

Template.Availabilities.rendered = function() {
    pageSession = nullMessages(pageSession);
};

Template.Availabilities.events({
    "click #dataview-insert-button": function(e, t) {
        e.preventDefault();
        Router.go("home_private.new_availability", {});
    },
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
    "errorMessage": function() {
        var getError = Router.current().params.query.error;
        if (getError) {
            pageSession.set("errorMessage", getError);
        }
        return pageSession.get("errorMessage");
    },
    getPageSession: function () {
        return pageSession;
    },
    availibilityCalendarOptions: function(){
        return {
            events: function(start, end, timezone, callback) {
                callback(getCalendarEvents(Availabilities.find({}).fetch(),Calendars,true));
            },
            eventClick: function(calEvent, jsEvent, view) {
                calendarClickOptions(calEvent);
            },
            defaultView: 'listWeek',
            timeFormat: 'H:mm',
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'listDay, listWeek, listYear'
            },
            buttonText: {
                listDay: 'Day',
                listWeek: 'Week',
                listYear: 'Year'
            }

        };
    }
});
