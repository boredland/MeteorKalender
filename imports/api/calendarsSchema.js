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
            value: Random.hexString(6),
            defaultValue: Random.hexString(6),
            type: "bootstrap-colorpicker"
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