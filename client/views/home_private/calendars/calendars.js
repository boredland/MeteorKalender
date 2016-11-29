import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
var pageSession = new ReactiveDict();

Template.Calendars.rendered = function() {
};

Template.Calendars.created = function() {
};

Template.Calendars.onCreated(function bodyOnCreated() {
        Meteor.subscribe('allCalendars');
    }
);

Template.Calendars.events({
    "click #delete-button": function(e) {
        e.preventDefault();
        var me = this;
        bootbox.dialog({
            message: "Delete? Are you sure?",
            title: "Delete",
            animate: false,
            buttons: {
                success: {
                    label: "Yes",
                    className: "btn-success",
                    callback: function() {
                        Meteor.call('calendars.remove', me._id);
                    }
                },
                danger: {
                    label: "No",
                    className: "btn-default"
                }
            }
        });
        return false;
    }
});

Template.Calendars.helpers({
    getCalendars(){
        return Calendars.find();
    }
});

Template.CalendarInsertForm.helpers({
    formCollection() {
        return Calendars;
    }
})