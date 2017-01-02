/**
 * Created by jonasstr on 18.12.16.
 */
import feiertagejs from "feiertagejs";
this.formatDateTime = function (date) {
    return moment(date).format('dddd, DD.MM.YYYY - HH:mm');
};

this.defaultMessageDuration;

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
    return new ReactiveDict();
    ;
};

this.nullMessages = function (pageSession) {
    pageSession.set("infoMessage", "");
    pageSession.set("errorMessage", "");
    return pageSession;
};

this.setErrorMessage = function (pageSession, message, duration) {
    return this.setMessage(pageSession, "errorMessage", message, duration);
};

this.setInfoMessage = function (pageSession, message, duration) {
    return this.setMessage(pageSession, "infoMessage", message, duration);
};

this.setMessage = function (pageSession, type, message, duration) {
    console.log(duration)
    if (!duration && duration !== null) {
        if (!duration) {
            duration = 3000;
        }
        setTimeout(function () {
            return pageSession.set(type, "");
        }, duration);
    }
    pageSession.set(type, message);
};


this.getCalendarEvents = function (events_in, calendars_in, private_in) {
    return events_in.map((availability) => {
        let calendar;
        let title, status, color;
        if (availability !== undefined) {
            if (availability.bookedByConfirmed) {
                status = "booked";
                color = "#FF0000";
            } else if (moment(availability.bookedByDate) >= moment().add(-reservationThreshold, 'm') && !availability.bookedByConfirmed && availability.bookedByDate) {
                status = "reserved";
                color = "#FFFF00";
            } else {
                status = "available";
                color = "#008000";
            }
            // here we generate the title-string:
            if (private_in) {
                if (calendar = calendars_in.findOne({_id: availability.calendarId[0].toString()})) {
                    title = calendar.name;
                    color = calendar.color;
                } else {
                    title = "unknown calendar";
                    color = "000"
                }
                if (status === "booked" || status === "reserved") {
                    if (calendar = calendars_in.findOne({_id: availability.bookedByCalendarId.toString()})){
                        title = calendar.name;
                        color = calendar.color;
                    }
                    title = title + " (" + status + " by " + availability.bookedByName + ")";
                }
                if (status === "available") {
                    title = title + " (" + status + ")";
                }
            } else if (!private_in) {
                title = status;
            }
            availability = {
                color: color,
                className: status,
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

this.calendarClickOptions = function (calEvent,pageSession) {
    if (calEvent.private) {
        if (calEvent.status === "booked" || calEvent.status === "reserved") {
            Router.go("home_private.appointment", {_appointmentId: calEvent.id});
        } else if (calEvent.status === "available" && calEvent.start >= new Date()) {
            Router.go("home_private.edit_availability", {_availabilityId: calEvent.id});
        } else if (calEvent.status === "available" && calEvent.start < new Date()){
            setErrorMessage(pageSession,"This availability is in the Past. You're not allowed to edit.");
        }
    } else if (!calEvent.private) {
        if (calEvent.status === "available") {
            Router.go("calendar_public.book", {
                _availabilityId: calEvent.id,
                _calendarSlug: Router.current().params._calendarSlug
            });
        } else if (calEvent.status === "reserved") {
            setErrorMessage(pageSession,"This availability is reserved by somebody. You may check back here in some minutes to check if this was confirmed.");
        } else if (calEvent.status === "booked") {
            setErrorMessage(pageSession,"This availability is booked by somebody.");
        }
    }
};