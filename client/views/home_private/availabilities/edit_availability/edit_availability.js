import {Availabilities} from '/imports/api/availabilitiesCollection';

function getCurrentAvailabilityId(){
    var currentId = Router.current().params._eventId;
    if (currentId != undefined) {
        return currentId;
    }
}

function getCurrentAvailability() {
    var availability = Availabilities.findOne({_id: getCurrentAvailabilityId()});
    if (availability != undefined){
        return availability;
    }
}

Template.EditAvailability.onRendered( () => {
    Meteor.subscribe('singleAvailability', getCurrentAvailabilityId());
});

var pageSession = new ReactiveDict();


Template.EditAvailability.rendered = function() {

};

Template.EditAvailability.created = function() {

};

Template.EditAvailability.events({


});

Template.EditAvailability.helpers({
    startDate(){
        return getCurrentAvailability().startDate;
    },
    endDate(){
        return getCurrentAvailability().endDate;
    }

});
