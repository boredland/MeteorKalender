/**
 * Created by tobi on 16.11.16.
 */
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
    categoryId: {
        type: String,
        max: 200
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: "startdate",
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
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
                    useCurrent: false
                }
            }
        }
    }
});