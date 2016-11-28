/**
 * Created by tobi on 23.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {calendarsSchema} from './calendarsSchema';

export const Calendars = new Mongo.Collection("calendars");
Calendars.attachSchema(calendarsSchema);

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allCalendars', function calendarsPublication() {
        return Calendars.find();
    });
};

Calendars.allow({
    insert: function (name,location,color,published) {
        return true; // is there some meaningful check we could use?
    }
});

Meteor.methods({
    'calendars.insert'(name,location,color,published) {
        console.log("calendars.insert run");
        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // add check for bookFrom > BookUntil..

        //finally, data are inserted into the collection
        Calendars.insert({
            userId: this.userId,
            name: name,
            location: location,
            color: color,
            published: published,
            linkslug: linkslug
        });
    },

    'calendars.remove'(calendarId){
        //check whether the ID which should be deleted is a String

        //Calendars.remove();
        //check whether the ID which should be deleted is a String
        check(calendarId, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Calendars.findOne(calendarId);
        if (this.userId !== toBeDeleted.userId){
            throw new Meteor.Error('not-authorized');
        }
        Calendars.remove(calendarId);

    },
    'calendars.addAvailability'(calendarID, availabilityID){
        console.log("insert availability called");
        Calendars.update(calendarID, {$set: {availabilities: availabilities.push(availabilityID)}});
    }
});