import {Test} from '../../../both/collections/test'

Template.HomePublic.rendered = function() {
	
};

Template.HomePublic.events({
	
});

//noinspection JSAnnotator,JSAnnotator
Template.HomePublic.helpers({
    tasks(){
        return Test.find({});
    }
});

//Try to add new Task
Template.HomePublic.events({
    'submit .new-tas'(event) {
        // Prevent default browser submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // insert a task into the collection
        Task.insert({
            createdAt: new Date(), //current time
            text,
        });

        //clear from
        target.text.value = '';
    }
});
