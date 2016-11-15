import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';
Template.HomePublic.rendered = function() {

};

Template.HomePublic.events({
    'submit .new-availability'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('availabilities.insert', text)

        // Clear form
        target.text.value = '';
    },
});

Template.HomePublic.helpers({

    getAvailabilities(){
        return Availabilities.find();
    }
});
