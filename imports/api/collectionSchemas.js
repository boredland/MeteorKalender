/**
 * Created by tobi on 16.11.16.
 */
export var availabilitiesSchema = new SimpleSchema({
    userId: {
        type: String,
        max: 200
    },
    categoryId: {
        type: String,
        max: 200
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
});