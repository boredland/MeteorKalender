export var calendarsSchema = new SimpleSchema({
    userId: {
        type: String,
        max: 200,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function () { return Meteor.userId() }
    },
    name: {
        type: String,
        max: 200,
        autoform: {

        }
    },
    location: {
        type: String,
        autoform: {

        }
    },
    color: {
        type: String,
        autoform: {
            id: "colorselector",
            options: [
                {label: "NAVY", value: "#001f3f", "data-color": "#001f3f"},
                {label: "BLUE", value: "#0074D9", "data-color": "#0074D9",selected:"selected"},
                {label: "AQUA", value: "#7FDBFF", "data-color": "#7FDBFF"},
                {label: "TEAL", value: "#39CCCC", "data-color": "#39CCCC"},
                {label: "YELLOW", value: "#FFDC00", "data-color": "#FFDC00"},
                {label: "ORANGE", value: "#FF851B", "data-color": "#FF851B"},
                {label: "FUCHSIA", value: "#F012BE", "data-color": "#F012BE"},
                {label: "PURPLE", value: "#B10DC9", "data-color": "#B10DC9"},
                {label: "BLACK", value: "#111111", "data-color": "#111111"},
                {label: "GRAY", value: "#AAAAAA", "data-color": "#AAAAAA"},
            ]
        }
    },
    published: {
        type: Boolean
    },
    availabilities:{
        type: Array,
        optional: true,
        autoform: {
            type: "hidden"
        }
    },
    "availabilities.$": {
        type: String
    },
    linkslug: {
        type: String,
        max: 5,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function() {
            if (this.isInsert) {
                return Random.id().substring(0,4);
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    }

})