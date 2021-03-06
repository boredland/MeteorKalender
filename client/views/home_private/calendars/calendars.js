import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
var pageSession = getDefaultPageSession();

Template.Calendars.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allCalendars');
});

Template.Calendars.rendered = function() {
    nullMessages(pageSession);
};

Template.Calendars.events({
    "change #published": (function(event, template) {
        var status = event.target.checked;
        Meteor.call('calendars.updatePublishedState',this._id,status);
    }),
    "change #listPublic": (function(event, template) {
        var status = event.target.checked;
        Meteor.call('calendars.updateListPublicState',this._id,status);
    }),
    "click #delete-button": function(e) {
        var me = this;
        e.preventDefault();
        bootbox.dialog({
            message: "Do you want to delete this calendar?",
            title: "Delete calendar",
            animate: false,
            buttons: {
                yes: {
                    label: "Yes",
                    className: "btn-danger",
                    callback: function() {
                        Meteor.call('calendars.remove',me._id, function(err, data) {
                            if (err && err.error === "notEmpty") {
                                setErrorMessage(pageSession, err.reason);
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
        var origin = window.location.origin;
        var link = origin + "/calendar_public/" + this.linkslug;
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
        setInfoMessage(pageSession,"Link is copied to your clipboard!");
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