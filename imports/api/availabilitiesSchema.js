/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

var checkDate = function (start,end) {
    var start = moment(start);
    var end = moment(end);
    if (start >= end) {
        return 'startTimeAfterEnd';
    };
    if (start.get('h') === end.get('h') && start.get('m') === end.get('m')){
        return 'sameTime';
    };
    if (start < moment()){
        return 'inThePast'
    };
};

var checkDateAndTime = function(startTime,endTime,date){
    var startTime = moment(startTime);
    var endTime = moment(endTime);
    var startDate = moment(new Date(date)).hour(startTime.get('h')).minute(startTime.get('m'));
    var endDate = moment(new Date(date)).hour(endTime.get('h')).minute(endTime.get('m'));
    return checkDate(startDate,endDate);
};

var checkDuration = function (start_in,end_in,chunkDuration_in) {
    var starttime = moment(new Date(start_in));
    var endtime = moment(new Date(end_in));
    var duration = Math.round((moment(endtime)-moment(starttime))/(1000*60));//|0; //<-- das ist die duration in minuten
    var chunkDuration = chunkDuration_in;
    if ((duration > 0) && (duration < chunkDuration)){
        return 'durationSmaller';
    };
    if ((duration%chunkDuration) !== 0) {
        return 'durationNotMultiple';
    };
};

SimpleSchema.messages({
    'startTimeAfterEnd': 'The start is after the end-time',
    'inThePast': "The start-time is in the past",
    'durationSmaller': 'The duration of your consultation hour is smaller than the chunk-period you selected',
    'durationNotMultiple': 'The duration of your consultation hour is not a multiple of the chunk-period you selected',
    'sameTime': 'Start- and Endtime are the same',
});

// This schema validates the insertions and the edit-page-form
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
            return checkDate(this.field("startDate").value,this.field("endDate").value);
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
            return checkDate(this.field("startDate").value,this.field("endDate").value);
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
        type: Array
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
    },
    bookedByConfirmationToken: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
        }
    },
    bookedByCancellationToken: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
        }
    },
    bookedByCalendarId: {
        type: String,
        optional: true,
        autoform: {
            type:  "hidden"
        }
    }
});

//This schema validates the form-submission for the insertions.
export var availabilitiesFormSchema = new SimpleSchema({
    startDate: {
        type: Date,
        autoform: {
            value: new Date(moment().seconds(0)),
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
            value: new Date(moment().set(0,'ms').set(0,'s').add(10,'m')),
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
            return checkDateAndTime(this.field("startTime").value,this.field("endTime").value,this.field("startDate").value);
        }
    },
    endTime: {
        type: Date,
        autoform: {
            value: new Date(moment().set(0,'ms').set(0,'s').add(20,'m')),
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
            return checkDateAndTime(this.field("startTime").value,this.field("endTime").value,this.field("startDate").value);
        }
    },
    chunkDuration: {
        label: "Split the Availibility into chunks of duration [Minutes]",
        type: Number,
        autoform: {
            step: 5,
            defaultValue: 10,
        },
        custom: function() {
            return checkDuration(this.field("startTime").value,this.field("endTime").value,this.field("chunkDuration").value);
        }
    },
    dontSkipHolidays:{
        type: Boolean,
        optional: true,
        defaultValue: false,
        label: "Don't skip holidays",
    },
    repeatInterval:{
        label: "Repeat Every",
        type: Number,
        optional: true,
        autoform: {
            type: "select",
            firstOption: "Don't repeat",
            options: [
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
            value: new Date(moment()),//.add(7,'d')),
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

// This validates the Booking-Form
export var bookingFormSchema = new SimpleSchema({
    availabilityId: {
        type: String,
        autoform: {
            type: "hidden",
        }
    },
    bookedByName: {
        type: String,
        label: "Name"
    },
    bookedByEmail: {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    bookedByCalendarId: {
        type: String,
        autoform: {
            type: "hidden",
        }
    }
});
