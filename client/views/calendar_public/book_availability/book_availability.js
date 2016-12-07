//var pageSession = new ReactiveDict();
//import {Availabilities} from '/imports/api/availabilitiesCollection';
//import {Calendars} from '/imports/api/calendarsCollection';
//import { Meteor } from 'meteor/meteor';

function getCurrentAvailabilityId(){
    var currentId = Router.current().params._eventId;
    if (currentId != undefined) {
        return currentId;
    }
}

Template.Booking.onCreated(function bodyOnCreated() {

});

Template.Booking.rendered = function() {
    console.log(getCurrentAvailabilityId());
};

Template.Booking.events({

});

Template.Booking.helpers({

});
