import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
import {availabilitiesFormSchema} from "../../../../imports/api/availabilitiesSchema";
var pageSession = new ReactiveDict();

Template.Availabilities.onRendered(function() {

});
///imports/api/availabilitiesCollection.js "publishes" the collection which is "subscribed" in this step. This way we can "use" the collection on the client.
Template.Availabilities.onCreated(
    function bodyOnCreated() {
        Meteor.subscribe('allAvailabilities');
        Meteor.subscribe('allCalendars');
    }
);

Template.Availabilities.rendered = function() {
    pageSession.set("invoicesInsertInsertFormInfoMessage", "");
    pageSession.set("invoicesInsertInsertFormErrorMessage", "");
    /*$('#availibilitiesCalendar').fullCalendar({
        events: function(callback) {
            var eventsArray = [];
            Availabilities.find().forEach(function(m){
                //console.log(m.startDate+" "+m.endDate)
                eventsArray.push(
                    { start: m.startDate, end: m.endDate }
                );
            });
            console.log(eventsArray);
            callback(eventsArray);
        },
        id: "availibilityCalendar",
        defaultView: 'listDay',
    });*/

    Meteor.autorun(function() {
        var eventsArray = [];
        Availabilities.find().forEach(function(m){
            eventsArray.push(
                { start: m.startDate, end: m.endDate }
            );
        });
        console.log(eventsArray);
    });
};
Template.Availabilities.helpers({
    getAvailabilities(){
        return Availabilities.find();
    },
    getCalendars(){
        return Calendars.find();
    },
    availabilitiesCalendarOptions () {
        var eventsArray = [ {start: new Date(), end: new Date(moment().add(60,'m'))}];
        return {
            id: "availibilityCalendar",
            events: eventsArray,
            defaultView: 'agendaWeek',
        };
    }
});

Template.Availabilities.created = function() {};

//Template.dpReplacement.replaces("afBootstrapDateTimePicker");

Template.Availabilities.events({
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
                        Meteor.call('availabilities.remove', me._id);
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

Template.AvailabilityInsertForm.events({
    /*'click .starttime': function (event, template) {
        var starttime = $(event.target).val();
        console.log("clicked starttime. starttime is "+starttime);
    },
    'click .endtime': function (event, template) {
        var endtime = $(event.target).val();
        console.log("clicked endtime. endtime is "+endtime);
    }*/

});

Template.AvailabilityInsertForm.helpers({
    formSchema: function() {
        return availabilitiesFormSchema;
    },
});
