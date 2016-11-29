/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

// This schema validates the insertion.
export var availabilitiesSchema = new SimpleSchema({
    userId: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    familyId: {
        type: String
    },
    calendarId: {
        type: Array,
        //type: Array,
        optional: true
    },
    'calendarId.$': {
        type: String
    }
});

//This schema validates the form-submission.
export var availabilitiesFormSchema = new SimpleSchema({
    startDate: {
        type: Date,
        optional: true,
            autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    minDate: new Date(),
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LL'
                }
            }
        }
    },
    startTime: {
        type: Date,
        optional: true,
        autoform: {
            afFieldInput: {
                class: "starttime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                }
            }
        }
    },
    endTime: {
        type: Date,
        optional: true,
        autoform: {
            afFieldInput: {
                class: "endtime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                }
            }
        }
    },
    chunkPeriod: {
        label: "Split the Availibility into chunks of duration [Minutes]",
        type: Number,
        autoform: {
            step: 5,
            defaultValue: 10,
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
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LL'
                }
            }
        }
    },
    calendarId: {
        type: Array,
        optional: true,
    },
    'calendarId.$': {
        type: String,
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    var opts = Calendars.find({}, {userId: this.userId}).map(function (calendars) {
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
    /*legalHolidays:{
      type: Boolean,
      optional: true
    },*/
});