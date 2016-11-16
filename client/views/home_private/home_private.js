import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
Template.HomePrivate.rendered = function() {

};

///imports/api/availabilitiesCollection.js "publishes" the collection which is "subscribed" in this step. This way we can "use" the collection on the client.
Template.HomePrivate.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allAvailabilities');
});

Template.HomePrivate.events({
    //function is triggered by "submit" event, which is defined in the home_private.html
    "submit": function(e, t) {
        //preventDefault prevents the event e from doing what it usually does. We define event e as "mongo collection insert"
        e.preventDefault();

            //declaration of variables which gonna be inserted into collection
            var userId = Meteor.userId();
            var startDate = new Date(t.find('#startdate').value.trim());
            var endDate = new Date(t.find('#enddate').value.trim());
            var categoryId =  t.find('#categoryid').value.trim();

        //calls the function wired to 'availabilities.insert' in /imports/api/availabilitiesCollection.js
        Meteor.call('availabilities.insert', userId, startDate, endDate, categoryId);

    },

    'click .delete':function(){
        Meteor.call('availabilities.remove', this._id);
    }
});

//function is called within home_private.html
Template.HomePrivate.helpers({
    getAvailabilities(){
        return Availabilities.find();
    }
});
