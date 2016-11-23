import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
var pageSession = new ReactiveDict();

Template.Availabilities.onRendered(function() {

});

Template.Availabilities.rendered = function() {
    pageSession.set("invoicesInsertInsertFormInfoMessage", "");
    pageSession.set("invoicesInsertInsertFormErrorMessage", "");
};

Template.Availabilities.helpers({
    getAvailabilities(){
        return Availabilities.find();
    }
});

Template.Availabilities.created = function() {};

Template.dpReplacement.replaces("afBootstrapDateTimePicker");

Template.Availabilities.events({
    "click #delete-button": function(e, t) {
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
})

Template.AvailabilityInsertForm.events({
    "change .startdate": function (e) {
        console.log("Here we should set mindate of .enddate");
    },
    "change .enddate": function (e) {
        console.log("Here we should set maxdate of .startdate");
    }
});

Template.AvailabilityInsertForm.helpers({
    formCollection() {
        return Availabilities;
    }
})