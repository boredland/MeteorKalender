import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
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
};

Template.Availabilities.helpers({
    getAvailabilities(){
        return Availabilities.find();
    },
    getCalendars(){
        return Calendars.find();
    }
});

Template.Availabilities.created = function() {};

Template.dpReplacement.replaces("afBootstrapDateTimePicker");

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
    "change .startdate": function (event, template) {
        var startdate = $(event.target).val();
        console.log(startdate);
    },
    "change .enddate": function (event, template) {
        var enddate = $(event.target).val();
        console.log(enddate);
    }
});

Template.AvailabilityInsertForm.helpers({
    formCollection() {
        return Availabilities;
    }
})