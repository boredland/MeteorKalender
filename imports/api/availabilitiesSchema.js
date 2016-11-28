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
            //label: false,
        },
        autoValue: function () {
            return Meteor.userId()
        },
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    stepping: 10,
                    inline: true,
                    locale: 'de',
                    format: 'LL'
                }
            }
        }
    },
    startTime: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "enddate",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 10,
                }
            }
        }
    },
    endTime: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "enddate",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 10,
                }
            }
        }
    },
    /*bookFrom: {
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
    },*/
    chunkPeriod: {
        label: "Split the Availibility into chunks of duration [Minutes]",
        type: Number,
        optional: true,
        autoform: {
            step: 5,
            defaultValue: 0,
        }
    },
    repeatInterval:{
        type: Number,
        optional: true,
        autoform: {
            type: "select",
            firstOption: false,
            options: [
                {label: "none", value: "0"},
                {label: "1 week", value: "1"},
                {label: "2 weeks", value: "2"},
                {label: "3 weeks", value: "3"},
                {label: "4 weeks", value: "4"}
            ]
        }
    },
    repeatUntil:{
        type: Date,
        optional: true,
        //allowedValues: [`1/1/2020`],
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    //sideBySide: true,
                    //pickTime: false,
                }
            }
        }
    },
    legalHolidays:{
      type: Boolean,
        optional: true
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
                    var opts = Calendars.find({}, {userId: this.userId}).map(function(calendars) {
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