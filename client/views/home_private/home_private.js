import {Availabilities} from '/imports/api/availabilitiesCollection'
import { Meteor } from 'meteor/meteor';

Template.HomePrivate.rendered = function() {

};

Template.HomePrivate.events({
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

Template.HomePrivate.helpers({

    getAvailabilities(){
        return Availabilities.find();
    }
});
