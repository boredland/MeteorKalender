import {availabilitiesSchema} from "../../../../../imports/api/availabilitiesSchema";
import {Availabilities} from '/imports/api/availabilitiesCollection';
window.Availabilities = Availabilities;
function getCurrentAvailabilityId(){
    var currentId = Router.current().params._eventId;
    if (currentId != undefined) {
        return currentId;
    }
}

function getCurrentAvailability() {
    var availability = Availabilities.findOne({_id: getCurrentAvailabilityId()});
    this.doc = availability;
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
    getAvailabilities(){

    }
    /*startDate(){
        if (getCurrentAvailability() != undefined){
            return getCurrentAvailability().startDate;
        }
    },
    endDate(){
        if (getCurrentAvailability() != undefined) {
            return getCurrentAvailability().endDate;
        }
    }*/
});
Template.AvailabilityUpdateForm.helpers({
    formSchema: function() {
        return availabilitiesSchema;
    },
    exampleDoc: function () {
        return getCurrentAvailability();
    }
});

AutoForm.hooks({
    availabilityUpdateForm: {
        onSuccess: function() {
            Router.go('home_private.availabilities');
        }
    }
});