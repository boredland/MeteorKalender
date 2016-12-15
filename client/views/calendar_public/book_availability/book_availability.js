//var pageSession = new ReactiveDict();
import {bookingFormSchema} from '/imports/api/availabilitiesSchema';

var calendar, availability;

Template.Booking.onCreated(function bodyOnCreated() {
    calendar = Calendars.findOne({linkslug: Router.current().params._calendarSlug});
    availability = Availabilities.findOne({_id: Router.current().params._availabilityId});
});

Template.Booking.rendered = function() {

};

Template.Booking.events({

});

Template.Booking.helpers({
    itemsReady:function() {
        if (availability && calendar){
            if (availability._id === Router.current().params._availabilityId){
                return true
            } else {
                document.location.reload(true);
            }
        } else {
            return false
        }
    },
    CurrentAvailabilityFrom: function () {
        return availability.startDate;
    },
    CurrentAvailabilityTo: function () {
        return availability.endDate;
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