/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

SimpleSchema.messages({
    'startTimeAfterEnd': 'The start-time is after the end-time',
    'endTimeBeforeStart': 'The end-time is before the start-time',
    'durationSmaller': 'The duration of your consultation hour is smaller than the chunk-period you selected',
    'durationNotMultiple': 'The duration of your consultation hour is not a multiple of the chunk-period you selected',
    'sameTime': 'Start- and Endtime are the same',
});

// This schema validates the insertion.
export var availabilitiesSchema = new SimpleSchema({
    userId: {
        type: String,
        autoform: {
            type: "hidden",
            label: false
        }
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    stepping: 5,
                    enabledHours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                    minDate: new Date(),
                }
            }
        },
        custom: function() {
            var startdate = moment(new Date(this.field("startDate").value));
            var enddate = moment(new Date(this.field("endDate").value));
            if (startdate >= enddate) {
                return 'startTimeAfterEnd';
            }
            if (startdate.get('h') == enddate.get('h') && startdate.get('m') == enddate.get('m')){
                return 'sameTime';
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
                    inline: true,
                    locale: 'de',
                    stepping: 5,
                    enabledHours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                    minDate: new Date(),
                }
            }
        },
        custom: function() {
            var startdate = moment(new Date(this.field("startDate").value));
            var enddate = moment(new Date(this.field("endDate").value));
            if (startdate >= enddate) {
                return 'endTimeBeforeStart';
            };
            if (startdate.get('h') == enddate.get('h') && startdate.get('m') == enddate.get('m')){
                return 'sameTime';
            }

        }
    },
    familyId: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
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
    },
    bookedByDate: {
        type: Date,
        optional: true,
        autoform: {
            type: "hidden",
        }
    },
    bookedByConfirmed: {
        type: Boolean,
        optional: true,
        autoform: {
            type: "hidden",
        }
    },
    bookedByName: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
        }

    },
    bookedByEmail: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
        }
    }
});

//This schema validates the form-submission.
export var availabilitiesFormSchema = new SimpleSchema({
    startDate: {
        type: Date,
        autoform: {
            value: new Date(moment().set(0,'ms').set(0,'s')),
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
            value: new Date(moment().set(0,'ms').set(0,'s')),
            afFieldInput: {
                class: "starttime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                    enabledHours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
                }
            }
        },
        custom: function() {
            var starttime = moment(new Date(this.field("startTime").value));
            var endtime = moment(new Date(this.field("endTime").value));
            if (starttime >= endtime) {
                return 'startTimeAfterEnd';
            }
        }
    },
    endTime: {
        type: Date,
        autoform: {
            value: new Date(moment().set(0,'ms').add(10,'m').set(0,'s')),
            afFieldInput: {
                class: "endtime",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                    enabledHours: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
                }
            }
        },
        custom: function() {
            var starttime = moment(new Date(this.field("startTime").value));
            var endtime = moment(new Date(this.field("endTime").value));
            if (starttime >= endtime) {
                return 'endTimeBeforeStart';
            }
        }
    },
    chunkPeriod: {
        label: "Split the Availibility into chunks of duration [Minutes]",
        type: Number,
        autoform: {
            step: 5,
            defaultValue: 10,
        },
        custom: function() {
            var starttime = moment(new Date(this.field("startTime").value));
            var endtime = moment(new Date(this.field("endTime").value));
            var duration = Math.round((moment(endtime)-moment(starttime))/(1000*60));//|0; //<-- das ist die duration in minuten
            //console.log(duration);

            var chunkperiod = this.field("chunkPeriod").value;

            if ((duration > 0) && (duration < chunkperiod)){
                return 'durationSmaller';
            }

            if ((duration%chunkperiod) != 0) {
                return 'durationNotMultiple';
            }
        }
    },
    dontSkipHolidays:{
        type: Boolean,
        optional: true,
        defaultValue: false,
        label: "Don't skip holidays",
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