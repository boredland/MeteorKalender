import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
var pageSession = new ReactiveDict();

Template.Availabilities.onRendered(function() {
    this.$('.datetimepicker_start').datetimepicker({
        format: 'YYYY-MM-DD HH:mm'
    });
    this.$('.datetimepicker_end').datetimepicker({
        format: 'YYYY-MM-DD HH:mm'
    });

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

Template.Availabilities.created = function() {

};

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
    //function is triggered by "submit" event, which is defined in the availabilities.html
    "submit": function(e, t) {
        //preventDefault prevents the event e from doing what it usually does. We define event e as "mongo collection insert"
        e.preventDefault();
        //declaration of variables which gonna be inserted into collection
        var userId = Meteor.userId();
        var startDate = new Date(t.find('#datetimepicker_start').value);
        var endDate = new Date(t.find('#datetimepicker_end').value);
        var categoryId =  t.find('#categoryid').value.trim();

        //calls the function wired to 'availabilities.insert' in /imports/api/availabilitiesCollection.js
        Meteor.call('availabilities.insert', userId, startDate, endDate, categoryId);

    }
});