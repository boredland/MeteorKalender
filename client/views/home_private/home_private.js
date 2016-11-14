import {Availabilities} from '/both/collections/availabilities'
var avail = Availabilities.find().fetch();

Template.HomePrivate.rendered = function() {
};

Template.HomePrivate.events({
	
});

Template.HomePrivate.helpers({
    availabilities(){
        return avail;
    },
    userid() {
        return Meteor.userId();
    }
});
