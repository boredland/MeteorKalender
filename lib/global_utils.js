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
    if (!duration && duration !== null) {
        if (!duration) {
            duration = 5000;
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
        let title = "", status, attendee_name = "", attendee_mail = "", color = "";
        let calendars;
        if (availability !== undefined) {
            if (availability.bookedByConfirmed) {
                status = "booked";
                color = "#FF0000";
                if (moment(availability.endDate) < moment()) {
                    status = "passed";
                }
            } else if (moment(availability.bookedByDate) >= moment().add(-reservationThreshold, 'm') && !availability.bookedByConfirmed && availability.bookedByDate) {
                status = "reserved";
                color = "#FFFF00";
            } else {
                status = "available";
                color = "#008000";
            }
            // here we generate the title-string:
            if (private_in) {
                attendee_name = availability.bookedByName;
                attendee_mail = availability.bookedByEmail;
                if (calendars = availability.calendarId) {
                    for (var i = 0; i < calendars.length; i++) {
                        if (calendar = calendars_in.findOne({_id: availability.calendarId[i].toString()})) {
                            title = title + calendar.name;
                            if ((i + 1) < calendars.length) {
                                title = title + ", "
                            }
                            color = tinycolor.mix(color, calendar.color).toHexString();
                        }
                    }
                } else {
                    title = "unknown calendar";
                    color = "000"
                }
                if (status === "booked" || status === "passed" || status === "reserved") {
                    if (calendar = calendars_in.findOne({_id: availability.bookedByCalendarId.toString()})) {
                        title = calendar.name;
                        color = calendar.color;
                    }
                    title = title + " (" + status;
                    if (status === "passed") {
                        title = title + " with "
                    } else {
                        title = title + " by "
                    }
                    title = title + availability.bookedByName + ")";
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
                private: private_in,
                attendee_name: attendee_name,
                attendee_mail: attendee_mail
            };
            return availability;
        }
    });
};

this.calendarClickOptions = function (calEvent, pageSession) {
    if (calEvent.private) {
        if (calEvent.status === "booked" || calEvent.status === "reserved" || calEvent.status === "passed") {
            Router.go("home_private.appointment", {_appointmentId: calEvent.id});
        } else if (calEvent.status === "available" && calEvent.start >= new Date()) {
            Router.go("home_private.edit_availability", {_availabilityId: calEvent.id});
        } else if (calEvent.status === "available" && calEvent.start < new Date()) {
            setErrorMessage(pageSession, "This availability is in the Past. You're not allowed to edit.");
        }
    } else if (!calEvent.private) {
        if (calEvent.status === "available") {
            Router.go("calendar_public.book", {
                _availabilityId: calEvent.id,
                _calendarSlug: Router.current().params._calendarSlug
            });
        } else if (calEvent.status === "reserved") {
            setErrorMessage(pageSession, "This availability is reserved by somebody. You may check back here in some minutes to check if this was confirmed.");
        } else if (calEvent.status === "booked") {
            setErrorMessage(pageSession, "This availability is booked by somebody.");
        }
    }
};
