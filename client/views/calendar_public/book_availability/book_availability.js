//var pageSession = new ReactiveDict();
import {bookingFormSchema} from '/imports/api/availabilitiesSchema';

var calendar, availability;

Template.Booking.onCreated(function bodyOnCreated() {
    calendar = this.data[0];
    availability = this.data[1];
});

Template.Booking.rendered = function() {

};



Template.Booking.events({

});

Template.Booking.helpers({
    itemsReady:function() {
        if (availability && calendar){
            return true
        } else {
            return false
        }
    },
    CurrentAvailabilityFrom: function () {
        return availability.startDate;
    },
    CurrentAvailabilityTo: function () {
        return availability.startDate;
    },
    CurrentCalendarName: function () {
        return calendar.name;
    }
});

Template.BookingForm.onCreated(function bodyOnCreated() {

});

Template.BookingForm.rendered = function() {

};

Template.BookingForm.helpers({
    formSchema: function() {
        return bookingFormSchema;
    },
});

AutoForm.hooks({
    bookAvailabilityForm: {
        before: {
            method: function(doc){
                doc.availabilityId = availability._id;
                return doc;
            }
        },
        onSuccess: function() {
            Router.go("calendar_public",{_calendarSlug: calendar.linkslug });
        }
    }
});