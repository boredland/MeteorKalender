import {Test} from '../../../both/collections/test'

Template.HomePublic.rendered = function() {
	
};

//noinspection JSAnnotator,JSAnnotator
Template.HomePublic.helpers({
    tasks(){
        return Test.find({});
    }
});

//Try to add new Task
Template.HomePublic.events({
    'submit .new-task'(event) {
        // Prevent default browser submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // insert a task into the collection
        Test.insert({
            createdAt: new Date(), //current time
            text,
        });

        //clear from
        target.text.value = '';
    }
});
