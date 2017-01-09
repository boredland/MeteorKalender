export var calendarsSchema = new SimpleSchema({
    userId: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
            label: false
        }
    },
    name: {
        type: String,
        max: 200,
        autoform: {
            afFormGroup: {
                iconHelp:{
                    title: 'Name',
                    content: 'This will be used as the topic of the calendar (e.g., "Consulation hour IT").',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            }
        }
    },
    location: {
        type: String,
        autoform: {
            afFormGroup: {
                iconHelp:{
                    title: 'Location',
                    content: 'This location will be shown to all the users booking an appointment in this calendar (e.g., "Frankfurt University, 1-R131").',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            }
        }
    },
    color: {
        type: String,
        autoform: {
            id: "colorselector",
            options: [
                {label: "NAVY", value: "#001f3f", "data-color": "#001f3f"},
                {label: "BLUE", value: "#0074D9", "data-color": "#0074D9", selected: "selected"},
                {label: "AQUA", value: "#7FDBFF", "data-color": "#7FDBFF"},
                {label: "TEAL", value: "#39CCCC", "data-color": "#39CCCC"},
                {label: "YELLOW", value: "#FFDC00", "data-color": "#FFDC00"},
                {label: "ORANGE", value: "#FF851B", "data-color": "#FF851B"},
                {label: "FUCHSIA", value: "#F012BE", "data-color": "#F012BE"},
                {label: "PURPLE", value: "#B10DC9", "data-color": "#B10DC9"},
                {label: "BLACK", value: "#111111", "data-color": "#111111"},
                {label: "GRAY", value: "#AAAAAA", "data-color": "#AAAAAA"},
            ],
            afFormGroup: {
                iconHelp:{
                    title: 'Color',
                    content: 'This color is only used to distinguish the appointments/availabilities visually for you.',
                    type: 'popover',
                    icon: 'fa fa-question-circle'
                }
            }
        }
    },
    published: {
        type: Boolean,
        optional: true,
        autoform: {
            type: "hidden",
            label: false,
            defaultValue: true
        }
    },
    linkslug: {
        type: String,
        optional: true,
        autoform: {
            type: "hidden",
            label: false
        }
    },
    defaultCalendar: {
        type: Boolean,
        optional: true,
        autoform: {
            type: "hidden",
            label: false,
        },
    }
});