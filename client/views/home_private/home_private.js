import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
Template.HomePrivate.rendered = function() {

};

Template.HomePrivate.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allAvailabilities');
});

Template.HomePrivate.events({
    "submit": function(e, t) {

        e.preventDefault();

        //pageSession.set("availabilitiesInsertInsertFormInfoMessage", "");   @Jonas: Was macht das???
        //pageSession.set("availabilitiesInsertInsertFormErrorMessage", "");

            //declaration of variables which gonna be inserted into collection
            var userId = Meteor.userId();
            var startDate = new Date(t.find('#startdate').value.trim());
            var endDate = new Date(t.find('#enddate').value.trim());
            var categoryId =  t.find('#categoryid').value.trim();

        //calls the function wired to 'availabilities.insert' in /imports/api/availabilitiesCollection.js
        Meteor.call('availabilities.insert', userId, startDate, endDate, categoryId);

    }
});

//function is called within home_private.html
Template.HomePrivate.helpers({
    getAvailabilities(){
        return Availabilities.find();
    }
});
