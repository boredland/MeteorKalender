/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

export var availabilitiesSchema = new SimpleSchema({
    userId: {
        type: String,
        max: 200,
        autoform: {
            type: "hidden",
            label: false,
        },
        autoValue: function () { return Meteor.userId() },
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                }
            }
        }
    },
    endDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "enddate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    useCurrent: false
                }
            }
        }
    },
    bookFrom: {
        type: Number,
        autoform: {
            type: "select",
            options: [
                {label: "0 days", value: "0"},
                {label: "1 day", value: "1"},
                {label: "7 days", value: "7"},
                {label: "14 days", value: "14"},
                {label: "21 days", value: "21"},
                {label: "28 days", value: "28"}
            ]
        }
    },
    bookUntil: {
        type: Number,
        decimal: true,
        min: 0,
        max: 72,
        autoform: {
            step: 0.25
        }
    },
    calendarId: {
        type: Array
    },
    'calendarId.$': {
        type: String,
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    var opts = Calendars.find({}, { userId: this.userId}).map(function(calendars) {
                        return {
                            label: calendars.name,
                            value: calendars._id
                        };
                    });
                    return opts;
                }
            }
        }
    }
});