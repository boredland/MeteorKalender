//var pageSession = new ReactiveDict();
import {bookingFormSchema} from '/imports/api/availabilitiesSchema';
import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

//import { Meteor } from 'meteor/meteor';
var currentAvailabilityId;

function getCurrentAvailabilityId(){
    currentAvailabilityId = Router.current().params._eventId;
    if (currentAvailabilityId != undefined) {
        return currentAvailabilityId;
    }
}
function getCurrentAvailability() {
    var availability = Availabilities.findOne({_id: getCurrentAvailabilityId()});
    if (availability != undefined){
        return availability;
    }
}
function getCurrentLinkSlug(){
    var calendar = Calendars.find({});
    return calendar.linkslug;
}

Template.Booking.onCreated(function bodyOnCreated() {
});

Template.BookingForm.rendered = function() {
};

Template.Booking.events({

});

Template.Booking.helpers({

});

Template.BookingForm.onCreated(
    function bodyOnCreated() {
        if (getCurrentAvailabilityId() != undefined){
            Meteor.subscribe('singleAvailability', getCurrentAvailabilityId());
            Meteor.subscribe('singleCalendarByAvailabilityId',getCurrentAvailabilityId());
        }
    }
);


Template.BookingForm.helpers({
    formSchema: function() {
        return bookingFormSchema;
    },
    CurrentAvailabilityFrom: function () {
        var availabilitiy = getCurrentAvailability();
        if (availabilitiy != undefined){
            return availabilitiy.startDate;
        }
    },
    CurrentAvailabilityTo: function () {
        var availabilitiy = getCurrentAvailability();
        if (availabilitiy != undefined){
            return availabilitiy.endDate;
        }
    }
});

AutoForm.hooks({
    bookAvailabilityForm: {
        before: {
            method: function(doc){
                doc.availabilityId = getCurrentAvailabilityId();
                return doc;
            }
        },
        onSuccess: function() {
            console.log(getCurrentLinkSlug());
            Router.go("calendar_public",{calendarPublicToken: getCurrentLinkSlug() });
        }
    }
});