/**
 * Created by tobi on 23.11.16.
 */
export var calendarsSchema = new SimpleSchema({
    userId: {
        type: String,
        max: 200,
        autoform: {
            type: "hidden",
            label: false,
        },
        autoValue: function () { return Meteor.userId() },
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
            type: "bootstrap-colorpicker"
        }
    },
    published: {
        type: Boolean,
        autoform: {

        }
    },
    linkslug: {
        type: String,
        autoform: {
            type: "hidden",
            label: false,
        },
        autoValue: function() {
            if (this.isInsert) {
                return Random.id();
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    }

})