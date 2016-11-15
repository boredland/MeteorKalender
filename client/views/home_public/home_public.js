import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
Template.HomePublic.rendered = function() {

};

Template.HomePublic.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allAvailabilities');
});

Template.HomePublic.helpers({
    getAvailabilities(){
        return Availabilities.find();
    }
});
