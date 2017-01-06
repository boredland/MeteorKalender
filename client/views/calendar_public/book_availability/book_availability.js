//var pageSession = new ReactiveDict();
import {bookingFormSchema} from '/imports/api/availabilitiesSchema';
var pageSession = getDefaultPageSession();
var calendar, availability;

Template.Booking.onCreated(function bodyOnCreated() {
    calendar = Calendars.findOne({linkslug: Router.current().params._calendarSlug});
    availability = Availabilities.findOne({_id: Router.current().params._availabilityId});
});

Template.Booking.events({
    "click .go-home": function(e, t) {
        Router.go("/");
    },
    "click #Back-button": function(e, t) {
        e.preventDefault();
        history.back();
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
    getPageSession: function () {
        return pageSession
    },
    success: function () {
        return pageSession.get("success");
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
            setInfoMessage(pageSession, "Your reservation was successful and is valid for the next 10 minutes. Please confirm the reservation using the link provided in the email we sent to you.", null);
            pageSession.set("success",true)
        },
        onError: function (result,error) {
            setErrorMessage(pageSession,error.reason);
        }
    }
});