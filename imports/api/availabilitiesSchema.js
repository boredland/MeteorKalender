/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';

var checkDate = function (startDate, endDate) {
    var start = moment(startDate);
    var end = moment(endDate);
    if (start >= end) {
        return 'startTimeAfterEnd';
    }
    if (start.get('h') === end.get('h') && start.get('m') === end.get('m')) {
        return 'sameTime';
    }
    if (start < moment()) {
        return 'inThePast'
    }
};

var checkDateAndTime = function (startTime_in, endTime_in, date_in) {
    var startTime = moment(startTime_in);
    var endTime = moment(endTime_in);
    var startDate = moment(new Date(date_in)).hour(startTime.get('h')).minute(startTime.get('m'));
    var endDate = moment(new Date(date_in)).hour(endTime.get('h')).minute(endTime.get('m'));
    return checkDate(startDate, endDate);
};

var checkDuration = function (start_in, end_in, chunkDuration_in) {
    var startTime = moment(new Date(start_in));
    var endTime = moment(new Date(end_in));
    var duration = Math.round((moment(endTime) - moment(startTime)) / (1000 * 60));//|0; //<-- das ist die duration in minuten
    var chunkDuration = chunkDuration_in;
    if ((duration > 0) && (duration < chunkDuration)) {
        return 'durationSmaller';
    }
    if ((duration % chunkDuration) !== 0) {
        return 'durationNotMultiple';
    }
};

SimpleSchema.messages({
    'startTimeAfterEnd': 'The start is after the end-time',
    'inThePast': "The start-time is in the past",
    'durationSmaller': 'The duration of your consultation hour is smaller than the chunk-period you selected',
    'durationNotMultiple': 'The duration of your consultation hour is not a multiple of the chunk-period you selected',
    'sameTime': 'Start- and Endtime are the same'
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
            readOnly: true,
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    ignoreReadonly: true,
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    stepping: 5,
                    enabledHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    minDate: new Date()
                }
            }
        },
        custom: function () {
            return checkDate(this.field("startDate").value, this.field("endDate").value);
        }
    },
    endDate: {
        type: Date,
        autoform: {
            readOnly: true,
            afFieldInput: {
                class: "enddate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    ignoreReadonly: true,
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    stepping: 5,
                    enabledHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                    minDate: new Date()
                }
            }
        },
        custom: function () {
            return checkDate(this.field("startDate").value, this.field("endDate").value);
        }
    },
    expiryDate: {
        type: Date,
        optional: true,
        autoform: {
            type: "hidden",
            label: false
        }
    },
    familyId: {
        type: String,
        autoform: {
            type: "hidden",
            label: false
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
            type: "hidden"
        }
    },
    bookedByConfirmed: {
        type: Boolean,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    bookedByName: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden"
        }

    },
    bookedByEmail: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    bookedByConfirmationToken: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    bookedByCancellationToken: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    bookedByCalendarId: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden"
        }
    }
});

//This schema validates the form-submission for the insertions.
export var availabilitiesFormSchema = new SimpleSchema({
    startDate: {
        type: Date,
        autoform: {
            value: new Date(moment().seconds(0)),
            readOnly: true,
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    ignoreReadonly: true,
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
            value: new Date(moment().set(0, 'ms').set(0, 's').add(10, 'm')),
            readOnly: true,
            afFieldInput: {
                class: "starttime",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    ignoreReadonly: true,
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                    enabledHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                }
            }
        },
        custom: function () {
            return checkDateAndTime(this.field("startTime").value, this.field("endTime").value, this.field("startDate").value);
        }
    },
    endTime: {
        type: Date,
        autoform: {
            value: new Date(moment().set(0, 'ms').set(0, 's').add(20, 'm')),
            readOnly: true,
            afFieldInput: {
                class: "endtime",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    ignoreReadonly: true,
                    sideBySide: true,
                    inline: true,
                    locale: 'de',
                    format: 'LT',
                    stepping: 5,
                    enabledHours: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                }
            }
        },
        custom: function () {
            return checkDateAndTime(this.field("startTime").value, this.field("endTime").value, this.field("startDate").value);
        }
    },
    chunkDuration: {
        label: "Split the Availibility into chunks of duration [Minutes]",
        type: Number,
        autoform: {
            step: 5,
            defaultValue: 10,
            afFormGroup: {
                iconHelp:{
                    title: 'Chunk duration',
                    content: 'The duration one session of your consultation hour should have.',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            }
        },
        custom: function () {
            return checkDuration(this.field("startTime").value, this.field("endTime").value, this.field("chunkDuration").value);
        }
    },
    skipHolidays: {
        type: Boolean,
        optional: true,
        defaultValue: true,
        label: "Skip holidays"
    },
    repeatInterval: {
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
            ],
            afFormGroup: {
                iconHelp:{
                    title: 'Repeat interval',
                    content: 'Number of weeks between two repetitions.',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            }
        }
    },
    repeatUntil: {
        type: Date,
        optional: true,
        autoform: {
            value: function () {
                return new Date(moment().add(AutoForm.getFieldValue("repeatInterval"), 'w'))
            },
            label: function () {
                if (!AutoForm.getFieldValue("repeatInterval")) {
                    return false;
                }
            },
            readOnly: true,
            afFormGroup: {
                iconHelp:{
                    title: 'Repeat until',
                    content: 'Date until the availabilities should be repeated.',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            },
            afFieldInput: {
                type: function () {
                    if (AutoForm.getFieldValue("repeatInterval")) {
                        return "bootstrap-datetimepicker"
                    }
                    return "hidden";
                },
                dateTimePickerOptions: function () {
                    if (AutoForm.getFieldValue("repeatInterval")) {
                        var firstIteration = new Date(moment(AutoForm.getFieldValue("startDate")).add(AutoForm.getFieldValue("repeatInterval"), 'w'));
                        var weekDay = moment(firstIteration).weekday();
                        var disabled = [];
                        for (var i = 0; i <= 6; i++) {
                            if (i !== weekDay) {
                                disabled.push(i);
                            }
                        }
                        return {
                            minDate: firstIteration,
                            ignoreReadonly: true,
                            sideBySide: true,
                            inline: true,
                            locale: 'de',
                            format: 'LL',
                            daysOfWeekDisabled: disabled
                        }
                    }
                },

            }
        }
    },
    calendarId: {
        type: Array,
        label: "Calendar"
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
            type: "hidden"
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
            type: "hidden"
        }
    }
});