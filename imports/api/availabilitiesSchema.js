/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';
import { Match } from 'meteor/check';

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
        min: function () {
            return new Date();
        },
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    minuteStepping: 10
                }
            }
        }
    },
    endDate: {
        type: Date,
        min: function () {
            var probe = AutoForm.getFieldValue("startDate");
            if (Match.test(probe, undefined)){
                return new Date();
            }
            return AutoForm.getFieldValue("startDate");

        },
        autoform: {
            afFieldInput: {
                class: "enddate",
                type: function () {
                    /*var probe = AutoForm.getFieldValue("startDate");
                    if (Match.test(probe, undefined)){
                        console.log("match.")
                        return "hidden";
                    }*/
                    return "bootstrap-datetimepicker";
                },
                dateTimePickerOptions: {
                    useCurrent: false,
                    sideBySide: true,
                    minuteStepping: 10
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
    repeatInterval:{
        type: Number,
        autoform: {
            type: "select",
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
        allowedValues: [`1/1/2020`],
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    pickTime: false
                }
            }
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