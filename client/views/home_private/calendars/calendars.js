import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
var pageSession = getDefaultPageSession();

Template.Calendars.onCreated(function bodyOnCreated() {
        Meteor.subscribe('allCalendars');
    }
);

Template.Calendars.events({
    "change #published": (function(event, template) {
        var status = event.target.checked;
        console.log("status of the checkbox of "+this.name+" changed to "+status)
    }),
    "click #delete-button": function(e) {
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete this calendar?",
            title: "Delete calendar",
            animate: false,
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-primary",
                    callback: function() {
                        Meteor.call('calendars.remove',me._id, function(err, data) {
                            if (err && err.error === "notEmpty") {
                                pageSession.set("errorMessage", err.reason);
                                console.log(err.reason)
                            } else {
                                Router.go('home_private.calendars');
                            }
                        });
                    }
                },
                no: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    },
    "click #dataview-insert-button": function(e) {
        e.preventDefault();
        Router.go("home_private.new_calendar", {});
    },
    "click #edit-button": function(e) {
        e.preventDefault();
        var me = this;
        Router.go("home_private.edit_calendar",{_calendarId: me._id});
    },
    "click #copy-button": function(e) {
        e.preventDefault();
        var me = this;
        var calendar = Calendars.findOne({_id: me._id});
        var origin = window.location.origin;
        var linkslug = calendar.linkslug;
        var link = origin + "/calendar_public/" + linkslug;
        //console.log(link);
        // Create an auxiliary hidden input
        var aux = document.createElement("input");
        // Get the text from the element passed into the input
        aux.setAttribute("value", link);
        // Append the aux input to the body
        document.body.appendChild(aux);
        // Highlight the content
        aux.select();
        // Execute the copy command
        document.execCommand("copy");
        // Remove the input from the body
        document.body.removeChild(aux);
    }
});

Template.Calendars.helpers({
    getCalendars(){
        return Calendars.find();
    },
    getPageSession: function () {
        return pageSession;
    }
});