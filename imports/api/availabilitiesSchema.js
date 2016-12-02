/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

SimpleSchema.messages({
    'startTimeAfterEndTime': 'The start-time is after or equal to the end-time.'
})

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
        //min: new Date(),
        autoform: {
            value: new Date(),
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    minDate: new Date(),
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
            value: new Date(),
            afFieldInput: {
                class: "starttime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
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
                value: new Date(moment().add(10,'m')),
                class: "endtime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    //minDate: new Date(moment().add(10,'m')),
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                }
            }
        },
        custom: function() {
            var starttime = moment(new Date(this.field("startTime").value));
            var endtime = moment(new Date(this.field("endTime").value));
            if (starttime >= endtime) {
                return 'startTimeAfterEndTime';
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
        autoform: {
            value: new Date(),
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    minDate: new Date(),
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LL',
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
                firstOption: false,
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
});