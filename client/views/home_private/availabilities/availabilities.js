import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';

var pageSession = getDefaultPageSession();

Template.Availabilities.rendered = function() {
    nullMessages(pageSession); 
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
            setErrorMessage(pageSession, getError);
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
                calendarClickOptions(calEvent,pageSession);
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
            },
            viewRender: function(currentView){
                try {
                    var maxDate = moment(Availabilities.findOne({}, {sort: {startDate: -1}}).startDate),
                        minDate = moment(Availabilities.findOne({}, {sort: {endDate: 1}}).endDate);
                } catch (e) {
                    console.log("Events-array empty.")
                }
                // Past
                if (minDate >= currentView.start && minDate <= currentView.end) {
                    $(".fc-prev-button").prop('disabled', true);
                    $(".fc-prev-button").addClass('fc-state-disabled');
                }
                else {
                    $(".fc-prev-button").removeClass('fc-state-disabled');
                    $(".fc-prev-button").prop('disabled', false);
                }
                // Future
                if (maxDate >= currentView.start && maxDate <= currentView.end) {
                    $(".fc-next-button").prop('disabled', true);
                    $(".fc-next-button").addClass('fc-state-disabled');
                } else {
                    $(".fc-next-button").removeClass('fc-state-disabled');
                    $(".fc-next-button").prop('disabled', false);
                }
            }
        };
    }
});
