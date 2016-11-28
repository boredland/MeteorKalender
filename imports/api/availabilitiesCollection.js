/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {availabilitiesSchema} from './availabilitiesSchema';

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allAvailabilities', function availabilitiesPublication() {
        return Availabilities.find();
    });
};

// it is best practise to explicitly allow crud-actions
Availabilities.allow({
    insert: function (startDate, endDate, calendarId,bookFrom,bookUntil,repeatInterval,repeatUntil) {
        return true; // is there some meaningful check we could use?
    }
});

//methods can be called in every .js file which has "import { Meteor } from 'meteor/meteor';" .
Meteor.methods({
    'availabilities.insert'(startDate, endDate, calendarId,bookFrom,bookUntil,repeatInterval,repeatUntil) {
        console.log("availibilities.insert run");
        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // add check for bookFrom > BookUntil..

        //finally, data are inserted into the collection
        Availabilities.insert({
            userId: this.userId,
            startDate: startDate,
            endDate: endDate,
            categoryId: calendarId,
            bookFrom: bookFrom,
            bookUntil: bookUntil,
            repeatInterval: repeatInterval,
            repeatUntil: repeatUntil,
            chunkPeriod: chunkPeriod
        });
    },

    'availabilities.remove'(availabilityID){
        //check whether the ID which should be deleted is a String
        check(availabilityID, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Availabilities.findOne(availabilityID);
        if (this.userId !== toBeDeleted.userId){
            throw new Meteor.Error('not-authorized');
        }
        Availabilities.remove(availabilityID);

    }
});