/**
 * Created by tobi on 16.11.16.
 */
import {Calendars} from '/imports/api/calendarsCollection';
import { HTTP } from 'meteor/http';

//var result = HTTP.call("GET", "http://feiertage.jarmedia.de/api/?jahr=2016&nur_land=HE&nur_daten=1&callback=hessenarray");


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
        min: function () {
            return new Date();
        },
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    sideBySide: true,
                    minuteStepping: 10,
                    defaultValue: function(){
                        return new Date();
                    }
                }
            }
        }
    },
    endTime: {
        type: Date,
        /*min: function () {
            return new Date();
        },*/
        autoform: {
            afFieldInput: {
                class: "enddate",
                type:  "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    useCurrent: false,
                    format: 'LT',
                    pickDate: false,
                    minuteStepping: 10,

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
        label: "Split the Availibility into chunks of size [Minutes]",
        type: Number,
        autoform: {
            step: 5
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
        //allowedValues: [`1/1/2020`],
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
    legalHolidays:{
      type: Boolean
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