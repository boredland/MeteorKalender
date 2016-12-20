/**
 * Created by jonasstr on 18.12.16.
 */
import feiertagejs from "feiertagejs";
this.formatDateTime = function (date) {
    return moment(date).format('dddd, DD.MM.YYYY - HH:mm');
};
this.reservationThreshold = 10; // Minutes before a reservation invalidates
/**
 * Überprüft, ob es sich um einen Feiertag handelt.
 * @param date
 * @returns {*|boolean}
 */
this.isThisBankHoliday = function (date) {
    return feiertagejs.isHoliday(new Date(date), 'HE');
};

this.getDefaultPageSession = function () {
    var pageSession = new ReactiveDict();
    pageSession.set("infoMessage", "");
    pageSession.set("errorMessage", "");
    return pageSession;
};

this.getCalendarEvents = function(events_in,calendars_in,private_in){
    return events_in.map( ( availability ) => {
        let calendar = calendars_in.findOne({_id: availability.calendarId.toString()});
        let title,status,color;
        if (availability !== undefined){
            if (availability.bookedByConfirmed) {
                status = "booked";
                color = "#FF0000";
            } else if (moment(availability.bookedByDate) >= moment().add(-reservationThreshold,'m') && !availability.bookedByConfirmed && availability.bookedByDate){
                status = "reserved";
                color = "#FFFF00";
            } else {
                status = "available";
                color = "#008000";
            }
            // here we generate the title-string:
            if (private_in){
                title = calendar.name
                if (status === "booked" || status === "reserved") {
                    title = title + " ("+status+" by "+availability.bookedByName+")";
                }
                if (status === "available") {
                    title = title + " ("+status+")";
                }
                color = calendar.color;
            } else if (!private_in){
                title = status;
            }
            availability = {
                color: color,
                start: availability.startDate,
                end: availability.endDate,
                title: title,
                id: availability._id,
                status: status,
                private: private_in
            };
            return availability;
        }
    });
};

this.calendarClickOptions = function (calEvent) {
    if (calEvent.private) {
        if (calEvent.status === "booked" || calEvent.status === "reserved") {
            Router.go("home_private.appointment",{_eventId: calEvent.id});
        } else if (calEvent.status === "available"){
            Router.go("home_private.edit_availability",{_eventId: calEvent.id});
        }
    } else if (!calEvent.private){
        if (calEvent.status === "available") {
            Router.go("calendar_public.book",{_availabilityId: calEvent.id, _calendarSlug: Router.current().params._calendarSlug});
        } else if (calEvent.status === "reserved"){
            pageSession.set("errorMessage", "This availability is reserved by somebody. You may check back here in some minutes to check if this was confirmed.");
        } else if (calEvent.status === "booked"){
            pageSession.set("errorMessage", "This availability is booked by somebody.");
        }
    }
};