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
        return Calendars.find({userId: this.userId});
    });
};

Calendars.allow({
    insert: function (name,location,color,published) {
        return true; // is there some meaningful check we could use?
    }
});

Meteor.methods({
     insertCalendar: function(doc) {
        console.log("insertCalendar run");
        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        //finally, data are inserted into the collection
        Calendars.insert({
            userId: this.userId,
            name: doc.name,
            location: doc.location,
            color: doc.color,
            published: doc.published,
            linkslug: doc.linkslug
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
        //Calendars.update(calendarID, {$set: {availabilities: availabilityID}});
    }
});