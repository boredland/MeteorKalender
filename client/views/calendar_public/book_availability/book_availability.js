//var pageSession = new ReactiveDict();
import {bookingFormSchema} from '/imports/api/availabilitiesSchema';
var pageSession = new ReactiveDict();
var calendar, availability;
var sucess = false
Template.Booking.onCreated(function bodyOnCreated() {
    pageSession.set("infoMessage", "");
    pageSession.set("errorMessage", "");
    calendar = Calendars.findOne({linkslug: Router.current().params._calendarSlug});
    availability = Availabilities.findOne({_id: Router.current().params._availabilityId});
});

Template.Booking.rendered = function() {

};

Template.Booking.events({
    "click .go-home": function(e, t) {
        Router.go("/");
    },
    "click #Back-button": function(e, t) {
        e.preventDefault();
        Router.go("home_public", {});
    }
});

Template.Booking.helpers({
    formSchema: function() {
        return bookingFormSchema;
    },
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
    },
    "errorMessage": function() {
        return pageSession.get("errorMessage");
    },
    "infoMessage": function() {
        return pageSession.get("infoMessage");
    }
});

AutoForm.hooks({
    bookAvailabilityForm: {
        before: {
            method: function(doc){
                doc.availabilityId = availability._id;
                doc.bookedByCalendarId = calendar._id;
                return doc;
            }
        },
        onSuccess: function() {
            pageSession.set("infoMessage", "Your reservation was successful and is valid for the next 10 minutes. Please confirm the reservation using the link provided in the email we sent to you.");
        },
        onError: function (result,error) {
            pageSession.set("errorMessage",error.reason);
        }
    }
});